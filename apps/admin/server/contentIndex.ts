import { readdir, readFile, stat } from 'node:fs/promises';
import { basename, extname, isAbsolute, join, posix, relative, resolve, sep } from 'node:path';
import { z } from 'zod';
import {
  bookMetaSchema,
  contentIndexSchema,
  curriculumLinksSchema,
  curriculumSchema,
} from '@mytutor/schemas';
import type {
  ContentBookEntry,
  ContentIndex,
  ContentTopicEntry,
  CurriculumEntry,
  TrashEntry,
} from '@mytutor/types';
import { topicStatus } from './topicStatus';

// Only the fields the index needs; full validation happens in the browser when a file is opened.
const structureHead = z.object({ source: z.object({ file: z.string() }) });
const sourceHead = z.object({
  book: z.object({ file: z.string() }),
  topic: z.object({ number: z.string() }),
});

export const exists = (path: string) =>
  stat(path).then(
    () => true,
    () => false,
  );

async function readJson<T>(path: string, schema: z.ZodType<T>): Promise<T | null> {
  try {
    return schema.parse(JSON.parse(await readFile(path, 'utf8')));
  } catch {
    return null;
  }
}

async function subdirs(path: string): Promise<string[]> {
  try {
    const entries = await readdir(path, { withFileTypes: true });
    return entries
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort();
  } catch {
    return [];
  }
}

const toPosix = (path: string) => path.split(sep).join(posix.sep);

/** Book id: the PDF file name without extension, stable across output folders. */
export const bookIdOf = (file: string) => basename(file, extname(file));

/** What the server knows about a book; the paths below never leave the server. */
export type ScannedBook = ContentBookEntry & {
  /** Absolute path of the textbook PDF, when a `book.json` names one that exists. */
  pdf: string | null;
  /** Folder where new topic outputs go: the one holding the PDF's `book.json`. */
  folder: string | null;
  /** Every folder under the root that holds any of this book's outputs (absolute paths). */
  folders: string[];
  /**
   * Where the panel saves the book's curriculum links: the file already holding them, else one in
   * the folder of the book's PDF (or of any book.json naming it), else in its first output folder.
   */
  linksFile: string | null;
};

/** A book's links to a curriculum, saved in its home folder. */
export const LINKS_FILE = 'curriculum-links.json';

/**
 * Scans `<root>/<folder>/` for parser outputs (`structure.json`, `topics/<n>/source.json`,
 * `topics/<n>/knowledge/knowledge.json`, `book.json`) and groups them by PDF file, since the
 * splitter and the source extractor may have written to different folders.
 */
export async function scanBooks(root: string): Promise<ScannedBook[]> {
  const books = new Map<string, ScannedBook>();
  const bookFor = (file: string) => {
    let book = books.get(file);
    if (!book) {
      book = {
        id: bookIdOf(file),
        file,
        title: null,
        structure: null,
        canExtract: false,
        topics: [],
        curriculumLinks: null,
        pdf: null,
        folder: null,
        folders: [],
        linksFile: null,
      };
      books.set(file, book);
    }
    return book;
  };
  const metaDirs = new Map<ScannedBook, string>();
  const holds = (book: ScannedBook, dir: string) => {
    if (!book.folders.includes(dir)) book.folders.push(dir);
  };

  for (const name of await subdirs(root)) {
    // Dot folders are not books: upload staging, deleted books (`.trash`).
    if (name.startsWith('.')) continue;
    const dir = join(root, name);
    const rel = (path: string) => toPosix(relative(root, path));
    const files = new Set<string>();

    const structure = await readJson(join(dir, 'structure.json'), structureHead);
    if (structure) {
      const book = bookFor(structure.source.file);
      holds(book, dir);
      book.structure ??= rel(join(dir, 'structure.json'));
      files.add(structure.source.file);
    }

    for (const number of await subdirs(join(dir, 'topics'))) {
      const topicDir = join(dir, 'topics', number);
      const head = await readJson(join(topicDir, 'source.json'), sourceHead);
      if (!head) continue;
      const book = bookFor(head.book.file);
      holds(book, dir);
      files.add(head.book.file);
      if (book.topics.some((t) => t.number === head.topic.number)) continue;
      const knowledge = join(topicDir, 'knowledge', 'knowledge.json');
      const hasKnowledge = await exists(knowledge);
      const entry: ContentTopicEntry = {
        number: head.topic.number,
        dir: rel(topicDir),
        source: rel(join(topicDir, 'source.json')),
        knowledge: hasKnowledge ? rel(knowledge) : null,
        ...(hasKnowledge
          ? await topicStatus(topicDir, knowledge)
          : { summary: null, review: null }),
      };
      book.topics.push(entry);
    }

    const meta = await readJson(join(dir, 'book.json'), bookMetaSchema);
    if (!meta) continue;
    const pdf = meta.pdf ? (isAbsolute(meta.pdf) ? meta.pdf : join(dir, meta.pdf)) : null;
    const pdfFound = pdf !== null && (await exists(pdf));
    // A book.json naming a PDF belongs to that PDF's book even before anything was split.
    if (pdfFound) files.add(basename(pdf));
    for (const file of files) {
      const book = bookFor(file);
      holds(book, dir);
      book.title ??= meta.title;
      metaDirs.set(book, metaDirs.get(book) ?? dir);
      if (pdfFound && basename(pdf) === file && !book.pdf) {
        book.pdf = pdf;
        book.folder = dir;
        book.canExtract = true;
      }
    }
  }

  for (const book of books.values()) {
    book.topics.sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }));
    for (const dir of book.folders) {
      const file = join(dir, LINKS_FILE);
      if (!(await exists(file))) continue;
      book.linksFile = file;
      book.curriculumLinks = await readJson(file, curriculumLinksSchema);
      break;
    }
    const home = book.folder ?? metaDirs.get(book) ?? book.folders[0];
    book.linksFile ??= home ? join(home, LINKS_FILE) : null;
  }
  return [...books.values()];
}

/** Deleted books wait here (see `deleteBook`); a dot folder, so never scanned as a book. */
export const TRASH_DIR = '.trash';
/** What a trash entry holds: the book's folders, moved as they were, and this description. */
export const TRASH_META = 'trash.json';

export const trashMetaSchema = z.object({
  bookId: z.string(),
  title: z.string().nullable(),
  deletedAt: z.string(),
  /** Names of the moved folders: each was `<root>/<name>` and is `<entry>/<name>` now. */
  folders: z.array(z.string()),
  sourceCount: z.number().int().nonnegative(),
  knowledgeCount: z.number().int().nonnegative(),
});

export type TrashMeta = z.output<typeof trashMetaSchema>;

export const readTrashMeta = (entry: string) => readJson(join(entry, TRASH_META), trashMetaSchema);

/** Deleted books that can be restored, newest first. */
export async function scanTrash(root: string): Promise<TrashEntry[]> {
  const trash = join(root, TRASH_DIR);
  const entries: TrashEntry[] = [];
  for (const id of await subdirs(trash)) {
    const meta = await readTrashMeta(join(trash, id));
    if (!meta) continue;
    const { folders: _folders, ...entry } = meta;
    entries.push({ id, ...entry });
  }
  return entries.sort((a, b) => b.deletedAt.localeCompare(a.deletedAt));
}

/** Curricula the team enters in the panel; a dot folder, so never scanned as a book. */
export const CURRICULA_DIR = '.curricula';

export const curriculumFile = (root: string, id: string) => join(root, CURRICULA_DIR, `${id}.json`);

export const readCurriculum = (root: string, id: string) =>
  readJson(curriculumFile(root, id), curriculumSchema);

/** Every curriculum, by title. */
export async function scanCurricula(root: string): Promise<CurriculumEntry[]> {
  const dir = join(root, CURRICULA_DIR);
  const names = await readdir(dir).catch(() => [] as string[]);
  const entries: CurriculumEntry[] = [];
  for (const name of names.filter((n) => n.endsWith('.json')).sort()) {
    const curriculum = await readJson(join(dir, name), curriculumSchema);
    if (!curriculum || `${curriculum.id}.json` !== name) continue;
    const { standards, ...entry } = curriculum;
    entries.push({
      ...entry,
      standardCount: standards.length,
      path: toPosix(relative(root, join(dir, name))),
    });
  }
  return entries.sort((a, b) => a.title.localeCompare(b.title, 'az'));
}

export async function buildContentIndex(root: string): Promise<ContentIndex> {
  const books = await scanBooks(root);
  return contentIndexSchema.parse({
    books: books.map(
      ({ pdf: _pdf, folder: _folder, folders: _folders, linksFile: _linksFile, ...book }) => book,
    ),
    trash: await scanTrash(root),
    curricula: await scanCurricula(root),
  });
}

const SERVED = new Set(['.json', '.png']);

/**
 * Maps a `/content/<path>` request to a file under the root, or null when the path escapes
 * the root or is not a pipeline output type (JSON, PNG). PDFs are never served.
 */
export function resolveContentPath(root: string, urlPath: string): string | null {
  let decoded: string;
  try {
    decoded = decodeURIComponent(urlPath.split('?')[0] ?? '');
  } catch {
    return null;
  }
  if (decoded.includes('\0')) return null;
  const absRoot = resolve(root);
  const path = resolve(absRoot, `.${posix.sep}${decoded.replace(/^\/+/, '')}`);
  if (!path.startsWith(absRoot + sep)) return null;
  return SERVED.has(extname(path).toLowerCase()) ? path : null;
}
