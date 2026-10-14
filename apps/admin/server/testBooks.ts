import { createHash, randomBytes } from 'node:crypto';
import { mkdir, mkdtemp, readFile, rename, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { subjectIdSchema, testBookSchema } from '@mytutor/schemas';
import type { TestBook } from '@mytutor/types';
import {
  exists,
  readTestBook,
  readTestBooks,
  TEST_BOOK_FILE,
  TEST_BOOKS_DIR,
  testBookDir,
} from './contentIndex';
import { writeJson } from './json';
import { cleanTitle, exclusive, PipelineError, safePdfName, saveUpload } from './pipeline';

/** Deleted test books wait in `.test-books/.trash/`, whole: nothing is erased. */
const TEST_BOOKS_TRASH = '.trash';
const STAGING = '.incoming-';
/** One add or delete at a time, so the duplicate check and the id stay sound. */
const LOCK = 'test-books';

/** `tb_` and ten random lower-case letters or digits. */
const newTestBookId = () => `tb_${[...randomBytes(10)].map((b) => (b % 36).toString(36)).join('')}`;

/** Pages of a PDF; a damaged or password-protected file cannot be added. */
async function pageCount(bytes: Buffer): Promise<number> {
  // pdf.js takes ownership of the array it is given.
  const task = getDocument({ data: new Uint8Array(bytes), verbosity: 0 });
  try {
    return (await task.promise).numPages;
  } catch {
    throw new PipelineError(422, 'not_readable', 'The PDF cannot be read');
  } finally {
    await task.destroy();
  }
}

export type AddTestBookInput = {
  root: string;
  fileName: string;
  title: string;
  subject: string;
  body: NodeJS.ReadableStream;
  now?: () => Date;
};

/**
 * Stores an uploaded test book. It is assembled in a staging folder and renamed into place
 * only when complete, so a failed upload leaves nothing behind. The same PDF twice is refused.
 */
export async function addTestBook({
  root,
  fileName,
  title,
  subject,
  body,
  now = () => new Date(),
}: AddTestBookInput) {
  const file = safePdfName(fileName);
  const cleanName = cleanTitle(title);
  const subjectId = subjectIdSchema.safeParse(subject);
  if (!file) throw new PipelineError(400, 'bad_name', 'The file name must end with .pdf');
  if (!cleanName) throw new PipelineError(400, 'bad_title', 'A title is required');
  if (!subjectId.success) throw new PipelineError(400, 'bad_subject', 'Unknown subject');

  const dir = join(root, TEST_BOOKS_DIR);
  await mkdir(dir, { recursive: true });
  const staging = await mkdtemp(join(dir, STAGING));
  try {
    const pdf = join(staging, file);
    await saveUpload(body, pdf);
    const bytes = await readFile(pdf);
    const sha256 = createHash('sha256').update(bytes).digest('hex');
    const pages = await pageCount(bytes);
    return await exclusive(LOCK, async () => {
      const twin = (await readTestBooks(root)).find((b) => b.pdf.sha256 === sha256);
      if (twin)
        throw new PipelineError(409, 'test_book_exists', `Already added as "${twin.title}"`);
      let id = newTestBookId();
      while (await exists(testBookDir(root, id))) id = newTestBookId();
      const at = now().toISOString();
      const book: TestBook = {
        schemaVersion: 1,
        id,
        title: cleanName,
        subject: subjectId.data,
        pdf: { file, bytes: bytes.length, sha256, pages },
        createdAt: at,
        updatedAt: at,
      };
      await writeJson(join(staging, TEST_BOOK_FILE), testBookSchema.parse(book));
      await rename(staging, testBookDir(root, id));
      return { testBookId: id };
    });
  } catch (error) {
    await rm(staging, { recursive: true, force: true });
    throw error;
  }
}

export type DeleteTestBookInput = { root: string; testBookId: string; now?: () => Date };

/** Moves a test book's folder to `.test-books/.trash/`, whole: nothing is erased. */
export async function deleteTestBook({
  root,
  testBookId,
  now = () => new Date(),
}: DeleteTestBookInput) {
  return exclusive(LOCK, async () => {
    if (!(await readTestBook(root, testBookId)))
      throw new PipelineError(404, 'no_test_book', 'Unknown test book');
    const trash = join(root, TEST_BOOKS_DIR, TEST_BOOKS_TRASH);
    await mkdir(trash, { recursive: true });
    const stamp = now().toISOString().replace(/[:.]/g, '-');
    await rename(testBookDir(root, testBookId), join(trash, `${testBookId}-${stamp}`));
    return { testBookId };
  });
}
