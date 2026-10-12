import { mkdir, mkdtemp, readdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { buildContentIndex } from './contentIndex';
import {
  createCurriculum,
  deleteCurriculum,
  saveCurriculum,
  saveCurriculumLinks,
} from './curricula';
import { PipelineError } from './pipeline';

const AT = new Date('2026-10-11T09:00:00.000Z');
const now = () => AT;

let root = '';
beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'mytutor-curricula-'));
});

const code = async (promise: Promise<unknown>) => {
  try {
    await promise;
    return 'ok';
  } catch (error) {
    return error instanceof PipelineError ? `${error.status} ${error.code}` : String(error);
  }
};

async function put(path: string, value: unknown) {
  await mkdir(join(root, path, '..'), { recursive: true });
  await writeFile(join(root, path), JSON.stringify(value));
}

const read = async (path: string): Promise<unknown> =>
  JSON.parse(await readFile(join(root, path), 'utf8'));

/** Book "r7" split into `split/` with topics 1.1 and 1.2, its book.json in `r7/`. */
async function book() {
  const topic = (number: string) => ({ type: 'topic', number, title: number, sections: [] });
  await put('split/structure.json', {
    source: { file: 'r7.pdf' },
    units: [{ index: 1, title: 'B', items: [topic('1.1'), topic('1.2')] }],
  });
  await put('r7/topics/1.1/source.json', { book: { file: 'r7.pdf' }, topic: { number: '1.1' } });
  await writeFile(join(root, 'r7', 'r7.pdf'), '%PDF-1.7\n');
  await put('r7/book.json', { title: 'Riyaziyyat 7', pdf: 'r7.pdf' });
}

const standards = [
  { code: '7-1.1.1', text: 'Rasional ədədləri tanıyır.', line: 'Ədədlər və əməllər' },
  { code: '7-1.1.2', text: 'Rasional ədədləri müqayisə edir.', line: 'Ədədlər və əməllər' },
  { code: '7-2.1.1', text: 'Tənlik qurur.', line: 'Cəbr və funksiyalar' },
];
const input = { title: 'Riyaziyyat 7 — ARTİ', subject: 'Riyaziyyat', grade: 7, standards };

describe('curricula', () => {
  it('creates, lists, saves and deletes a curriculum', async () => {
    const { id } = await createCurriculum({ root, body: input, now });
    expect(id).toMatch(/^riyaziyyat-7-arti-[0-9a-f]{6}$/);
    expect(await read(`.curricula/${id}.json`)).toEqual({
      id,
      ...input,
      updatedAt: AT.toISOString(),
    });
    expect((await buildContentIndex(root)).curricula).toEqual([
      {
        id,
        title: input.title,
        subject: 'Riyaziyyat',
        grade: 7,
        standardCount: 3,
        path: `.curricula/${id}.json`,
        updatedAt: AT.toISOString(),
      },
    ]);
    // The dot folder is never taken for a book.
    expect((await buildContentIndex(root)).books).toEqual([]);

    await saveCurriculum({ root, id, body: { ...input, standards: standards.slice(0, 1) }, now });
    expect((await buildContentIndex(root)).curricula[0]?.standardCount).toBe(1);
    expect(await deleteCurriculum({ root, id })).toEqual({ id });
    expect(await readdir(join(root, '.curricula'))).toEqual([]);
  });

  it('refuses bad input, duplicate codes and unknown or path-like ids', async () => {
    expect(await code(createCurriculum({ root, body: { ...input, title: ' ' } }))).toBe(
      '400 bad_request',
    );
    const dup = { ...input, standards: [standards[0], standards[0]] };
    expect(await code(createCurriculum({ root, body: dup }))).toBe('400 bad_request');
    for (const id of ['nope', '../x', '.curricula', 'A'])
      expect(await code(saveCurriculum({ root, id, body: input }))).toBe('404 no_curriculum');
    expect(await code(deleteCurriculum({ root, id: '../split' }))).toBe('404 no_curriculum');
  });
});

describe('saveCurriculumLinks', () => {
  const links = (curriculumId: string | null, extra = {}) => ({
    curriculumId,
    topics: { '1.1': ['7-1.1.1', '7-1.1.1', '7-1.1.2'], '1.2': [] },
    items: [{ topic: '1.1', itemId: 'k001', fingerprint: 'abc', codes: ['7-2.1.1'] }],
    ...extra,
  });

  it("saves next to the book's book.json and lists the file in the index", async () => {
    await book();
    const { id } = await createCurriculum({ root, body: input });
    expect(await saveCurriculumLinks({ root, bookId: 'r7', body: links(id), now })).toEqual({
      updatedAt: AT.toISOString(),
    });
    expect(await read('r7/curriculum-links.json')).toEqual({
      curriculumId: id,
      // Duplicates and empty topics are dropped.
      topics: { '1.1': ['7-1.1.1', '7-1.1.2'] },
      items: [{ topic: '1.1', itemId: 'k001', fingerprint: 'abc', codes: ['7-2.1.1'] }],
      updatedAt: AT.toISOString(),
    });
    const [entry] = (await buildContentIndex(root)).books;
    expect(entry?.curriculumLinks).toEqual(await read('r7/curriculum-links.json'));
  });

  it('refuses unknown books, topics, curricula and standards', async () => {
    await book();
    const { id } = await createCurriculum({ root, body: input });
    expect(await code(saveCurriculumLinks({ root, bookId: 'x', body: links(id) }))).toBe(
      '404 no_book',
    );
    const badTopic = links(id, { topics: { '9.9': ['7-1.1.1'] } });
    expect(await code(saveCurriculumLinks({ root, bookId: 'r7', body: badTopic }))).toBe(
      '400 bad_topic',
    );
    expect(await code(saveCurriculumLinks({ root, bookId: 'r7', body: links('nope-1') }))).toBe(
      '404 no_curriculum',
    );
    expect(await code(saveCurriculumLinks({ root, bookId: 'r7', body: links(null) }))).toBe(
      '400 no_curriculum',
    );
    const unknown = links(id, { topics: { '1.1': ['9-9.9.9'] } });
    expect(await code(saveCurriculumLinks({ root, bookId: 'r7', body: unknown }))).toBe(
      '400 unknown_standard',
    );
    // Clearing the curriculum with no links is fine.
    const cleared = links(null, { topics: {}, items: [] });
    expect(await code(saveCurriculumLinks({ root, bookId: 'r7', body: cleared }))).toBe('ok');
  });

  it('keeps a saved link to a standard later removed from the curriculum', async () => {
    await book();
    const { id } = await createCurriculum({ root, body: input });
    await saveCurriculumLinks({ root, bookId: 'r7', body: links(id) });
    await saveCurriculum({ root, id, body: { ...input, standards: standards.slice(1) } });
    // 7-1.1.1 is gone from the curriculum but was linked already: other edits still save.
    const edited = links(id, { topics: { '1.1': ['7-1.1.1'], '1.2': ['7-1.1.2'] } });
    expect(await code(saveCurriculumLinks({ root, bookId: 'r7', body: edited }))).toBe('ok');
    // Once nothing links it any more, it is unknown like any other code.
    await saveCurriculumLinks({ root, bookId: 'r7', body: links(id, { topics: {}, items: [] }) });
    expect(await code(saveCurriculumLinks({ root, bookId: 'r7', body: edited }))).toBe(
      '400 unknown_standard',
    );
  });

  it('refuses to delete a curriculum a book links to', async () => {
    await book();
    const { id } = await createCurriculum({ root, body: input });
    await saveCurriculumLinks({ root, bookId: 'r7', body: links(id) });
    expect(await code(deleteCurriculum({ root, id }))).toBe('409 curriculum_in_use');
    await saveCurriculumLinks({ root, bookId: 'r7', body: links(null, { topics: {}, items: [] }) });
    expect(await code(deleteCurriculum({ root, id }))).toBe('ok');
  });
});
