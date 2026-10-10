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
  stat,
  writeFile,
} from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { Transform } from 'node:stream';
import { pipeline as pipe } from 'node:stream/promises';
import { z } from 'zod';
import { BOOK_TITLE_MAX } from '@mytutor/schemas';
import type { BookMeta, ContentActionErrorCode } from '@mytutor/types';
import { bookIdOf, exists, scanBooks } from './contentIndex';

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

  // Lower-case key: on case-insensitive disks "A.pdf" and "a.pdf" share one folder.
  return exclusive(`book:${bookId.toLowerCase()}`, async () => {
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

  return exclusive(`topic:${bookId}:${topic}`, async () => {
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
