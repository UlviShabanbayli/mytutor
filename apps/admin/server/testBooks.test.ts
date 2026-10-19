import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { buildContentIndex, readTestBook, TEST_BOOKS_DIR } from './contentIndex';
import { PipelineError } from './pipeline';
import { addTestBook, deleteTestBook } from './testBooks';

/** A real PDF with `pages` empty pages; `note` makes two files differ. */
function pdf(pages: number, note = ''): Buffer {
  const kids = Array.from({ length: pages }, (_, i) => `${3 + i} 0 R`).join(' ');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    `<< /Type /Pages /Kids [${kids}] /Count ${pages} >>`,
    ...Array.from(
      { length: pages },
      () => '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] >>',
    ),
  ];
  let out = `%PDF-1.4\n%${note}\n`;
  const offsets: number[] = [];
  objects.forEach((body, i) => {
    offsets.push(Buffer.byteLength(out));
    out += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = Buffer.byteLength(out);
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) out += `${String(offset).padStart(10, '0')} 00000 n \n`;
  out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(out, 'latin1');
}

const body = (bytes: Buffer) => Readable.from([bytes]);
const code = (promise: Promise<unknown>) =>
  promise.then(
    () => null,
    (error: unknown) => (error instanceof PipelineError ? error.code : String(error)),
  );
const now = () => new Date('2026-10-15T10:00:00.000Z');

let root: string;
beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'mytutor-test-books-'));
});
afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

const add = (
  bytes: Buffer,
  fields: Partial<{ fileName: string; title: string; subject: string }> = {},
) =>
  addTestBook({
    root,
    fileName: 'DİM test toplusu.pdf',
    title: 'Riyaziyyat test toplusu',
    subject: 'riyaziyyat',
    body: body(bytes),
    now,
    ...fields,
  });

describe('addTestBook', () => {
  it('stores the PDF beside test-book.json, with its pages, and lists it in the index', async () => {
    const { testBookId } = await add(pdf(3));
    expect(testBookId).toMatch(/^tb_[a-z0-9]{10}$/);
    const book = await readTestBook(root, testBookId);
    expect(book).toMatchObject({
      schemaVersion: 1,
      title: 'Riyaziyyat test toplusu',
      subject: 'riyaziyyat',
      pdf: { file: 'DIM-test-toplusu.pdf', pages: 3 },
      createdAt: '2026-10-15T10:00:00.000Z',
    });
    const stored = await readFile(join(root, TEST_BOOKS_DIR, testBookId, 'DIM-test-toplusu.pdf'));
    expect(stored.equals(pdf(3))).toBe(true);
    const index = await buildContentIndex(root);
    expect(index.testBooks).toEqual([
      expect.objectContaining({ id: testBookId, subject: 'riyaziyyat', pages: 3 }),
    ]);
  });

  it('refuses the same PDF twice, an unknown subject and an unreadable PDF, leaving nothing', async () => {
    await add(pdf(2));
    expect(await code(add(pdf(2), { fileName: 'other.pdf', title: 'Başqa ad' }))).toBe(
      'test_book_exists',
    );
    expect(await code(add(pdf(2, 'x'), { subject: 'astrologiya' }))).toBe('bad_subject');
    expect(await code(add(Buffer.from('%PDF-1.4\nnot really a pdf\n')))).toBe('not_readable');
    expect(await code(add(Buffer.from('hello')))).toBe('not_pdf');
    // Only the first book is there: no staging folders are left behind.
    const names = (await readdir(join(root, TEST_BOOKS_DIR))).filter((n) => !n.startsWith('.'));
    expect(names).toHaveLength(1);
    expect(
      (await readdir(join(root, TEST_BOOKS_DIR))).filter((n) => n.startsWith('.incoming')),
    ).toEqual([]);
  });
});

describe('deleteTestBook', () => {
  it('moves the book to the test-book trash, whole, and drops it from the index', async () => {
    const { testBookId } = await add(pdf(1));
    await deleteTestBook({ root, testBookId, now });
    expect(await readTestBook(root, testBookId)).toBeNull();
    expect((await buildContentIndex(root)).testBooks).toEqual([]);
    const trash = await readdir(join(root, TEST_BOOKS_DIR, '.trash'));
    expect(trash).toEqual([`${testBookId}-2026-10-15T10-00-00-000Z`]);
    expect(await code(deleteTestBook({ root, testBookId }))).toBe('no_test_book');
    // An id that is not one never reaches the disk.
    expect(await code(deleteTestBook({ root, testBookId: '../..' }))).toBe('no_test_book');
  });
});
