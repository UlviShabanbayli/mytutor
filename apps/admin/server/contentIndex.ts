import { readdir, readFile, stat } from 'node:fs/promises';
import { basename, extname, isAbsolute, join, posix, relative, resolve, sep } from 'node:path';
import { z } from 'zod';
import {
  bookMetaSchema,
  contentIndexSchema,
  CURRICULUM_ID,
  curriculumSchema,
  standardLinksSchema,
  standardSetSchema,
  TEST_BOOK_ID,
  testBookSchema,
  testQuestionsDocumentSchema,
  topicLessonSchema,
} from '@mytutor/schemas';
import type {
  ContentBookEntry,
  ContentIndex,
  ContentTopicEntry,
  Curriculum,
  CurriculumEntry,
  LessonEntry,
  StandardSetEntry,
  TestBook,
  TestBookEntry,
  TrashEntry,
} from '@mytutor/types';
import { topicStatus } from './topicStatus';

// Only the fields the index needs; full validation happens in the browser when a file is opened.
/** The part of an answer key that names its book. */
const answersHead = z.object({ book: z.object({ file: z.string() }) });

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
   * Where the panel saves the book's standard set links: the file already holding them, else one in
   * the folder of the book's PDF (or of any book.json naming it), else in its first output folder.
   */
  linksFile: string | null;
};

/** A book's links to a standard set, saved in its home folder. */
export const LINKS_FILE = 'standard-links.json';
/** Where links were saved before standard sets were renamed; still read, never rewritten. */
export const LEGACY_LINKS_FILE = 'curriculum-links.json';

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
        standardLinks: null,
        answers: null,
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

    const answers = await readJson(join(dir, 'answers', 'answers.json'), answersHead);
    if (answers) {
      const book = bookFor(answers.book.file);
      holds(book, dir);
      book.answers ??= rel(join(dir, 'answers', 'answers.json'));
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
    found: for (const dir of book.folders)
      for (const name of [LINKS_FILE, LEGACY_LINKS_FILE]) {
        const file = join(dir, name);
        if (!(await exists(file))) continue;
        // Saves always go to the current file name, which then shadows a legacy file.
        book.linksFile = join(dir, LINKS_FILE);
        book.standardLinks = await readJson(file, standardLinksSchema);
        break found;
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

/** Official standard sets the team enters in the panel; dot folders, never scanned as books. */
export const STANDARDS_DIR = '.standards';
/**
 * Where standard sets were saved while they were called curricula. Still read, never
 * rewritten: saving one writes it to STANDARDS_DIR, which then takes precedence.
 */
export const LEGACY_STANDARDS_DIR = '.curricula';

/** Where a standard set is written. */
export const standardSetFile = (root: string, id: string) =>
  join(root, STANDARDS_DIR, `${id}.json`);

const legacyStandardSetFile = (root: string, id: string) =>
  join(root, LEGACY_STANDARDS_DIR, `${id}.json`);

/** Every file a standard set may be stored in, current location first. */
export const standardSetFiles = (root: string, id: string) => [
  standardSetFile(root, id),
  legacyStandardSetFile(root, id),
];

export async function readStandardSet(root: string, id: string) {
  for (const file of standardSetFiles(root, id)) {
    const set = await readJson(file, standardSetSchema);
    if (set) return set;
  }
  return null;
}

/** Every standard set, by title; one saved in both locations is listed once, from the current. */
export async function scanStandardSets(root: string): Promise<StandardSetEntry[]> {
  const entries = new Map<string, StandardSetEntry>();
  for (const dir of [join(root, STANDARDS_DIR), join(root, LEGACY_STANDARDS_DIR)]) {
    const names = await readdir(dir).catch(() => [] as string[]);
    for (const name of names.filter((n) => n.endsWith('.json')).sort()) {
      const standardSet = await readJson(join(dir, name), standardSetSchema);
      if (!standardSet || `${standardSet.id}.json` !== name || entries.has(standardSet.id))
        continue;
      const { standards, ...entry } = standardSet;
      entries.set(standardSet.id, {
        ...entry,
        standardCount: standards.length,
        path: toPosix(relative(root, join(dir, name))),
      });
    }
  }
  return [...entries.values()].sort((a, b) => a.title.localeCompare(b.title, 'az'));
}

/**
 * Curricula live in `<root>/.curricula/<id>/curriculum.json`, one folder each, so lessons and
 * scenarios can sit beside them later. Flat `.curricula/<id>.json` files in the same folder are
 * standard sets saved before their rename; the two never collide.
 */
export const CURRICULA_DIR = '.curricula';
const CURRICULUM_FILE = 'curriculum.json';

export const curriculumFile = (root: string, id: string) =>
  join(root, CURRICULA_DIR, id, CURRICULUM_FILE);

export async function readCurriculum(root: string, id: string): Promise<Curriculum | null> {
  if (!CURRICULUM_ID.test(id)) return null;
  try {
    const result = curriculumSchema.safeParse(
      JSON.parse(await readFile(curriculumFile(root, id), 'utf8')),
    );
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

const LESSONS_DIR = 'lessons';
const LESSON_FILE = 'lesson.json';

/** `.curricula/<id>/lessons/<bookId>/<number>/lesson.json`: one lesson per textbook topic. */
export const lessonFile = (
  root: string,
  { curriculumId, bookId, number }: { curriculumId: string; bookId: string; number: string },
) => join(root, CURRICULA_DIR, curriculumId, LESSONS_DIR, bookId, number, LESSON_FILE);

/** A curriculum's lessons that have a text or a draft, for the content index. */
export async function scanLessons(root: string, curriculumId: string): Promise<LessonEntry[]> {
  const base = join(root, CURRICULA_DIR, curriculumId, LESSONS_DIR);
  if (!(await exists(base))) return [];
  const files = (await readdir(base, { recursive: true })).filter(
    (file) => file.endsWith(`${sep}${LESSON_FILE}`) || file === LESSON_FILE,
  );
  const entries: LessonEntry[] = [];
  for (const file of files) {
    const lesson = await readJson(join(base, file), topicLessonSchema);
    if (!lesson) continue;
    entries.push({
      bookId: lesson.topic.bookId,
      number: lesson.topic.number,
      path: toPosix(relative(root, join(base, file))),
      text: lesson.text !== null,
      draft: lesson.draft !== null,
      updatedAt: lesson.updatedAt,
    });
  }
  return entries;
}

/** Every curriculum, by title. */
export async function scanCurricula(root: string): Promise<CurriculumEntry[]> {
  const dir = join(root, CURRICULA_DIR);
  const folders = await readdir(dir, { withFileTypes: true }).catch(() => []);
  const entries: CurriculumEntry[] = [];
  for (const folder of folders) {
    if (!folder.isDirectory()) continue;
    const curriculum = await readCurriculum(root, folder.name);
    if (!curriculum || curriculum.id !== folder.name) continue;
    const { schemaVersion: _version, createdAt: _created, ...entry } = curriculum;
    entries.push({
      ...entry,
      lessons: await scanLessons(root, curriculum.id),
      path: toPosix(relative(root, curriculumFile(root, curriculum.id))),
    });
  }
  return entries.sort((a, b) => a.title.localeCompare(b.title, 'az'));
}

/**
 * Test books live in `<root>/.test-books/<id>/` (`test-book.json` and the PDF), apart from the
 * textbooks: questions are split from them and keyed to textbook topics.
 */
export const TEST_BOOKS_DIR = '.test-books';
export const TEST_BOOK_FILE = 'test-book.json';

export const testBookDir = (root: string, id: string) => join(root, TEST_BOOKS_DIR, id);

/** A test book by id; null for an id that is not one (it never reaches a path) or no file. */
export async function readTestBook(root: string, id: string): Promise<TestBook | null> {
  if (!TEST_BOOK_ID.test(id)) return null;
  return readJson(join(testBookDir(root, id), TEST_BOOK_FILE), testBookSchema);
}

/** Every test book with a readable `test-book.json`, newest first. */
export async function readTestBooks(root: string): Promise<TestBook[]> {
  const names = await readdir(join(root, TEST_BOOKS_DIR)).catch(() => [] as string[]);
  const books = await Promise.all(names.map((name) => readTestBook(root, name)));
  return books
    .filter((b): b is TestBook => b !== null)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** What was split from a test book so far, counted for the list and the book's page. */
async function testBookQuestions(root: string, id: string) {
  const path = posix.join(TEST_BOOKS_DIR, id, 'questions.json');
  const doc = await readJson(join(root, path), testQuestionsDocumentSchema);
  if (!doc) return null;
  const qs = doc.questions;
  return {
    path,
    total: qs.length,
    answered: qs.filter((q) => q.answer).length,
    linked: qs.filter((q) => q.links.some((l) => l.role === 'required')).length,
    uncovered: qs.filter((q) => q.uncovered).length,
    flagged: qs.filter((q) => q.flags.length).length,
    pagesRead: doc.pages.length,
  };
}

export const scanTestBooks = async (root: string): Promise<TestBookEntry[]> =>
  Promise.all(
    (await readTestBooks(root)).map(async ({ id, title, subject, pdf, createdAt }) => {
      const topics = posix.join(TEST_BOOKS_DIR, id, 'topics.json');
      return {
        id,
        title,
        subject,
        file: pdf.file,
        pages: pdf.pages,
        bytes: pdf.bytes,
        createdAt,
        questions: await testBookQuestions(root, id),
        topics: (await exists(join(root, topics))) ? topics : null,
      };
    }),
  );

export async function buildContentIndex(root: string): Promise<ContentIndex> {
  const books = await scanBooks(root);
  return contentIndexSchema.parse({
    books: books.map(
      ({ pdf: _pdf, folder: _folder, folders: _folders, linksFile: _linksFile, ...book }) => book,
    ),
    trash: await scanTrash(root),
    standardSets: await scanStandardSets(root),
    curricula: await scanCurricula(root),
    testBooks: await scanTestBooks(root),
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
