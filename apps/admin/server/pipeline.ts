import { execFile } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import {
  mkdir,
  mkdtemp,
  open,
  readdir,
  readFile,
  rename,
  rm,
  rmdir,
  stat,
  writeFile,
} from 'node:fs/promises';
import { createRequire } from 'node:module';
import { basename, dirname, join } from 'node:path';
import { Transform } from 'node:stream';
import { pipeline as pipe } from 'node:stream/promises';
import { z } from 'zod';
import { BOOK_TITLE_MAX } from '@mytutor/schemas';
import type { BookMeta, ContentActionErrorCode } from '@mytutor/types';
import {
  bookIdOf,
  exists,
  readTrashMeta,
  scanBooks,
  TRASH_DIR,
  TRASH_META,
  type TrashMeta,
} from './contentIndex';

/** An error the panel shows as-is: `code` maps to an i18n message, `status` to HTTP. */
export class PipelineError extends Error {
  constructor(
    readonly status: number,
    readonly code: ContentActionErrorCode,
    message: string,
  ) {
    super(message);
  }
}

/** Runs a parser CLI (`split` or `source`) with arguments; rejects with its stderr tail. */
export type CliRunner = (cli: 'split' | 'source', args: string[]) => Promise<void>;

export const MAX_PDF_BYTES = 300 * 1024 * 1024;
const CLI_TIMEOUT_MS = 10 * 60 * 1000;

const requireFrom = createRequire(import.meta.url);

/** Runs the textbook-parser CLIs through tsx in a child process, so the dev server stays light. */
export const runParserCli: CliRunner = (cli, args) => {
  // The package exports only its entry (src/index.ts); the CLIs sit next to it.
  const parserDir = dirname(dirname(requireFrom.resolve('@mytutor/textbook-parser')));
  const tsx = join(dirname(requireFrom.resolve('tsx/package.json')), 'dist', 'cli.mjs');
  const script = join(parserDir, 'src', cli === 'split' ? 'cli.ts' : 'sourceCli.ts');
  return new Promise((resolvePromise, reject) => {
    execFile(
      process.execPath,
      [tsx, script, ...args],
      { cwd: parserDir, timeout: CLI_TIMEOUT_MS, maxBuffer: 16 * 1024 * 1024 },
      (error, _stdout, stderr) => {
        if (!error) return resolvePromise();
        const tail = stderr.trim().split('\n').slice(-6).join('\n');
        reject(new Error(tail || error.message));
      },
    );
  });
};

const AZ: Record<string, string> = {
  ə: 'e',
  Ə: 'E',
  ı: 'i',
  İ: 'I',
  ş: 's',
  Ş: 'S',
  ç: 'c',
  Ç: 'C',
  ğ: 'g',
  Ğ: 'G',
  ö: 'o',
  Ö: 'O',
  ü: 'u',
  Ü: 'U',
};

/**
 * A safe file name for an uploaded textbook: Azerbaijani letters transliterated, anything else
 * outside [A-Za-z0-9._-] replaced, ".pdf" kept. Null when nothing usable is left.
 */
export function safePdfName(name: string): string | null {
  const base = name.split(/[\\/]/).pop() ?? '';
  if (!/\.pdf$/i.test(base)) return null;
  const stem = base
    .slice(0, -4)
    .normalize('NFC')
    .replace(/[əƏıİşŞçÇğĞöÖüÜ]/g, (c) => AZ[c] ?? c)
    .replace(/[^A-Za-z0-9._-]+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '')
    .slice(0, 100);
  return stem ? `${stem}.pdf` : null;
}

/** Book titles are shown as plain text; keep them single-line and bounded. */
export function cleanTitle(title: string): string | null {
  const clean = title.replace(/\s+/g, ' ').trim().slice(0, BOOK_TITLE_MAX);
  return clean || null;
}

/** Topic numbers as the splitter writes them ("4.1"). */
export const TOPIC_NUMBER = /^\d{1,2}\.\d{1,2}$/;

const running = new Set<string>();

/** Lower-case: on case-insensitive disks "A.pdf" and "a.pdf" share one folder. */
const bookKey = (bookId: string) => `book:${bookId.toLowerCase()}`;
const topicKey = (bookId: string, topic: string) => `topic:${bookId}:${topic}`;

/** One action per key at a time (the same book or topic is never written twice at once). */
async function exclusive<T>(key: string, work: () => Promise<T>): Promise<T> {
  if (running.has(key)) throw new PipelineError(409, 'busy', `${key} is already being processed`);
  running.add(key);
  try {
    return await work();
  } finally {
    running.delete(key);
  }
}

/** Copies the upload to disk, enforcing the size limit and the PDF signature. */
async function saveUpload(body: NodeJS.ReadableStream, path: string): Promise<void> {
  let size = 0;
  const limit = new Transform({
    transform(chunk: Buffer, _enc, done) {
      size += chunk.length;
      if (size > MAX_PDF_BYTES) done(new PipelineError(413, 'too_large', 'PDF is too large'));
      else done(null, chunk);
    },
  });
  await pipe(body, limit, createWriteStream(path, { flags: 'wx' }));
  const head = Buffer.alloc(5);
  const file = await open(path, 'r');
  try {
    await file.read(head, 0, 5, 0);
  } finally {
    await file.close();
  }
  if (head.toString('latin1') !== '%PDF-')
    throw new PipelineError(400, 'not_pdf', 'The file is not a PDF');
}

// Only the topic numbers are needed here.
const structureTopics = z.object({
  units: z.array(
    z.object({ items: z.array(z.object({ type: z.string(), number: z.string().optional() })) }),
  ),
});

async function topicNumbers(structurePath: string): Promise<string[]> {
  try {
    const parsed = structureTopics.parse(JSON.parse(await readFile(structurePath, 'utf8')));
    return parsed.units.flatMap((u) =>
      u.items.flatMap((i) => (i.type === 'topic' && i.number ? [i.number] : [])),
    );
  } catch {
    return [];
  }
}

export type AddBookInput = {
  root: string;
  fileName: string;
  title: string;
  body: NodeJS.ReadableStream;
  run?: CliRunner;
};

/** Staging folders start with "." so the index never lists a half-made book. */
const STAGING = '.incoming-';
const STALE_STAGING_MS = 60 * 60 * 1000;

/** Removes staging folders a crashed or killed server left behind (older than an hour). */
async function removeStaleStaging(root: string) {
  const names = await readdir(root).catch(() => [] as string[]);
  for (const name of names.filter((n) => n.startsWith(STAGING))) {
    const path = join(root, name);
    const info = await stat(path).catch(() => null);
    if (info && Date.now() - info.mtimeMs > STALE_STAGING_MS)
      await rm(path, { recursive: true, force: true });
  }
}

/**
 * Stores an uploaded textbook and splits it into units and topics. All work happens in a
 * staging folder that is renamed to `<root>/<bookId>/` only when the book is complete, so an
 * interrupted or failed upload never leaves a half-made book (and a retry is not blocked).
 */
export async function addBook({ root, fileName, title, body, run = runParserCli }: AddBookInput) {
  const file = safePdfName(fileName);
  const cleanName = cleanTitle(title);
  if (!file) throw new PipelineError(400, 'bad_name', 'The file name must end with .pdf');
  if (!cleanName) throw new PipelineError(400, 'bad_title', 'A title is required');
  const bookId = bookIdOf(file);
  const dir = join(root, bookId);

  return exclusive(bookKey(bookId), async () => {
    const known = (await scanBooks(root)).some((b) => b.id.toLowerCase() === bookId.toLowerCase());
    if (known || (await exists(dir)))
      throw new PipelineError(409, 'exists', `A book from ${file} already exists`);

    await mkdir(root, { recursive: true });
    await removeStaleStaging(root);
    const staging = await mkdtemp(join(root, STAGING));
    try {
      const pdf = join(staging, file);
      const partial = `${pdf}.part`;
      await saveUpload(body, partial);
      await rename(partial, pdf);
      try {
        await run('split', [pdf, '--out', staging]);
      } catch (error) {
        throw new PipelineError(
          422,
          'split_failed',
          error instanceof Error ? error.message : String(error),
        );
      }
      // A readable PDF that is not a textbook splits "successfully" into nothing.
      if ((await topicNumbers(join(staging, 'structure.json'))).length === 0)
        throw new PipelineError(422, 'not_textbook', 'No units or topics were found in this PDF');
      const meta: BookMeta = { title: cleanName, pdf: file };
      await writeFile(join(staging, 'book.json'), `${JSON.stringify(meta, null, 2)}\n`);
      try {
        await rename(staging, dir);
      } catch {
        throw new PipelineError(409, 'exists', `A book from ${file} already exists`);
      }
      return { bookId };
    } catch (error) {
      // Only this request's own staging folder is removed; a finished book is never touched.
      await rm(staging, { recursive: true, force: true });
      throw error;
    }
  });
}

export type ExtractSourceInput = {
  root: string;
  bookId: string;
  topic: string;
  run?: CliRunner;
};

/** Extracts one topic's source layer (page images, blocks, lines, figures) into the book folder. */
export async function extractSource({
  root,
  bookId,
  topic,
  run = runParserCli,
}: ExtractSourceInput) {
  if (!TOPIC_NUMBER.test(topic)) throw new PipelineError(400, 'bad_topic', 'Invalid topic number');
  const book = (await scanBooks(root)).find((b) => b.id === bookId);
  if (!book) throw new PipelineError(404, 'no_book', 'Unknown book');
  if (!book.pdf || !book.folder)
    throw new PipelineError(409, 'no_pdf', 'The PDF of this book is not on disk');
  const { pdf, folder } = book;
  const topics = book.structure ? await topicNumbers(join(root, book.structure)) : [];
  if (!topics.includes(topic)) throw new PipelineError(404, 'no_topic', 'Unknown topic');

  return exclusive(topicKey(bookId, topic), async () => {
    // The book may have been deleted between the scan above and taking the lock; while the
    // lock is held, `deleteBook` refuses to run.
    if (running.has(bookKey(bookId)))
      throw new PipelineError(409, 'busy', 'The book is being deleted or restored');
    if (!(await exists(folder))) throw new PipelineError(404, 'no_book', 'Unknown book');
    try {
      await run('source', [pdf, '--topic', topic, '--out', join(folder, 'topics', topic)]);
    } catch (error) {
      throw new PipelineError(
        422,
        'source_failed',
        error instanceof Error ? error.message : String(error),
      );
    }
    return { bookId, topic };
  });
}

/** Moves folders in order; if one fails, moves the earlier ones back and rethrows. */
async function moveAll(moves: { from: string; to: string }[]): Promise<void> {
  const done: { from: string; to: string }[] = [];
  try {
    for (const move of moves) {
      await rename(move.from, move.to);
      done.push(move);
    }
  } catch (error) {
    // Put back what already moved, so a failure never splits a book in two.
    for (const move of done.reverse()) await rename(move.to, move.from).catch(() => {});
    throw error;
  }
}

/**
 * Removes a trash entry's description and folder once nothing else is in it. While a folder is
 * still inside (a move back failed), the description stays so the entry remains restorable.
 */
async function dropEntryIfEmpty(entry: string) {
  const left = await readdir(entry).catch(() => null);
  if (!left?.every((name) => name === TRASH_META)) return;
  await rm(join(entry, TRASH_META), { force: true });
  await rmdir(entry).catch(() => {});
}

/** A folder name a trash entry may name: a plain, visible child of the root. */
const isPlainName = (name: string) => /^[^./\\][^/\\]*$/.test(name);

/** "2026-10-10T18:15:00.000Z" + "riyaziyyat 7" → "2026-10-10T18-15-00-000Z-riyaziyyat-7-". */
const trashPrefix = (bookId: string, at: string) =>
  `${at.replace(/[:.]/g, '-')}-${bookId.replace(/[^A-Za-z0-9._-]+/g, '-').slice(0, 80)}-`;

export type DeleteBookInput = { root: string; bookId: string; now?: () => Date };

/**
 * Deletes a book from the panel by moving every folder that holds its outputs (structure,
 * topic sources, knowledge documents, the uploaded PDF) to `<root>/.trash/<id>/`, where
 * `restoreBook` finds them. Nothing is erased: knowledge documents cost AI calls to rebuild.
 * A folder that also holds another book's outputs is never moved; the delete is refused.
 */
export async function deleteBook({ root, bookId, now = () => new Date() }: DeleteBookInput) {
  return exclusive(bookKey(bookId), async () => {
    // Checked before the first await, so no extraction of this book can start or be running.
    const prefix = topicKey(bookId, '');
    if ([...running].some((key) => key.startsWith(prefix)))
      throw new PipelineError(409, 'busy', 'A topic of this book is being extracted');
    const books = await scanBooks(root);
    const book = books.find((b) => b.id === bookId);
    if (!book) throw new PipelineError(404, 'no_book', 'Unknown book');
    const shared = book.folders.filter((dir) =>
      books.some((other) => other !== book && other.folders.includes(dir)),
    );
    if (shared.length)
      throw new PipelineError(
        409,
        'shared_folder',
        `Also holds another book: ${shared.map((dir) => basename(dir)).join(', ')}`,
      );

    const deletedAt = now().toISOString();
    const trash = join(root, TRASH_DIR);
    await mkdir(trash, { recursive: true });
    const entry = await mkdtemp(join(trash, trashPrefix(bookId, deletedAt)));
    const meta: TrashMeta = {
      bookId,
      title: book.title,
      deletedAt,
      folders: book.folders.map((dir) => basename(dir)),
      sourceCount: book.topics.filter((t) => t.source).length,
      knowledgeCount: book.topics.filter((t) => t.knowledge).length,
    };
    try {
      // Written first: if the server dies halfway, the entry still says what belongs where.
      await writeFile(join(entry, TRASH_META), `${JSON.stringify(meta, null, 2)}\n`);
      await moveAll(book.folders.map((dir) => ({ from: dir, to: join(entry, basename(dir)) })));
    } catch (error) {
      await dropEntryIfEmpty(entry);
      throw error;
    }
    return { bookId, trashId: basename(entry) };
  });
}

export type RestoreBookInput = { root: string; trashId: string };

/** Moves a deleted book's folders back from the trash; refused if anything took their place. */
export async function restoreBook({ root, trashId }: RestoreBookInput) {
  const notFound = () => new PipelineError(404, 'no_trash', 'No such deleted book');
  if (!isPlainName(trashId)) throw notFound();
  const entry = join(root, TRASH_DIR, trashId);
  const found = await readTrashMeta(entry);
  if (!found) throw notFound();

  return exclusive(bookKey(found.bookId), async () => {
    // Read again under the lock: the entry may have been restored meanwhile.
    const meta = await readTrashMeta(entry);
    if (!meta?.folders.every(isPlainName)) throw notFound();
    const conflict = () =>
      new PipelineError(409, 'restore_conflict', `A book from ${meta.bookId} was added again`);
    // A book still listed only from folders this entry names is what an interrupted delete left
    // behind: those folders stay where they are and the rest move back next to them.
    const live = (await scanBooks(root)).find(
      (b) => b.id.toLowerCase() === meta.bookId.toLowerCase(),
    );
    if (live && !live.folders.every((dir) => meta.folders.includes(basename(dir))))
      throw conflict();
    const moves: { from: string; to: string }[] = [];
    for (const name of meta.folders) {
      const move = { from: join(entry, name), to: join(root, name) };
      // A folder missing from the entry never got there (the delete was interrupted).
      if (!(await exists(move.from))) continue;
      if (await exists(move.to)) throw conflict();
      moves.push(move);
    }
    await moveAll(moves);
    await dropEntryIfEmpty(entry);
    return { bookId: meta.bookId };
  });
}
