import { mkdir, mkdtemp, readdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { buildContentIndex } from './contentIndex';
import {
  createStandardSet,
  deleteStandardSet,
  saveStandardSet,
  saveStandardLinks,
} from './standardSets';
import { PipelineError } from './pipeline';

const AT = new Date('2026-10-11T09:00:00.000Z');
const now = () => AT;

let root = '';
beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'mytutor-standardSets-'));
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

describe('standard sets', () => {
  it('creates, lists, saves and deletes a standard set', async () => {
    const { id } = await createStandardSet({ root, body: input, now });
    expect(id).toMatch(/^riyaziyyat-7-arti-[0-9a-f]{6}$/);
    expect(await read(`.standards/${id}.json`)).toEqual({
      id,
      ...input,
      updatedAt: AT.toISOString(),
    });
    expect((await buildContentIndex(root)).standardSets).toEqual([
      {
        id,
        title: input.title,
        subject: 'Riyaziyyat',
        grade: 7,
        standardCount: 3,
        path: `.standards/${id}.json`,
        updatedAt: AT.toISOString(),
      },
    ]);
    // The dot folder is never taken for a book.
    expect((await buildContentIndex(root)).books).toEqual([]);

    await saveStandardSet({ root, id, body: { ...input, standards: standards.slice(0, 1) }, now });
    expect((await buildContentIndex(root)).standardSets[0]?.standardCount).toBe(1);
    expect(await deleteStandardSet({ root, id })).toEqual({ id });
    expect(await readdir(join(root, '.standards'))).toEqual([]);
  });

  it('refuses bad input, duplicate codes and unknown or path-like ids', async () => {
    expect(await code(createStandardSet({ root, body: { ...input, title: ' ' } }))).toBe(
      '400 bad_request',
    );
    const dup = { ...input, standards: [standards[0], standards[0]] };
    expect(await code(createStandardSet({ root, body: dup }))).toBe('400 bad_request');
    for (const id of ['nope', '../x', '.standards', 'A'])
      expect(await code(saveStandardSet({ root, id, body: input }))).toBe('404 no_standard_set');
    expect(await code(deleteStandardSet({ root, id: '../split' }))).toBe('404 no_standard_set');
  });
});

describe('saveStandardLinks', () => {
  const links = (standardSetId: string | null, extra = {}) => ({
    standardSetId,
    topics: { '1.1': ['7-1.1.1', '7-1.1.1', '7-1.1.2'], '1.2': [] },
    items: [{ topic: '1.1', itemId: 'k001', fingerprint: 'abc', codes: ['7-2.1.1'] }],
    ...extra,
  });

  it("saves next to the book's book.json and lists the file in the index", async () => {
    await book();
    const { id } = await createStandardSet({ root, body: input });
    expect(await saveStandardLinks({ root, bookId: 'r7', body: links(id), now })).toEqual({
      updatedAt: AT.toISOString(),
    });
    expect(await read('r7/standard-links.json')).toEqual({
      standardSetId: id,
      // Duplicates and empty topics are dropped.
      topics: { '1.1': ['7-1.1.1', '7-1.1.2'] },
      items: [{ topic: '1.1', itemId: 'k001', fingerprint: 'abc', codes: ['7-2.1.1'] }],
      updatedAt: AT.toISOString(),
    });
    const [entry] = (await buildContentIndex(root)).books;
    expect(entry?.standardLinks).toEqual(await read('r7/standard-links.json'));
  });

  it('refuses unknown books, topics, standard sets and standards', async () => {
    await book();
    const { id } = await createStandardSet({ root, body: input });
    expect(await code(saveStandardLinks({ root, bookId: 'x', body: links(id) }))).toBe(
      '404 no_book',
    );
    const badTopic = links(id, { topics: { '9.9': ['7-1.1.1'] } });
    expect(await code(saveStandardLinks({ root, bookId: 'r7', body: badTopic }))).toBe(
      '400 bad_topic',
    );
    expect(await code(saveStandardLinks({ root, bookId: 'r7', body: links('nope-1') }))).toBe(
      '404 no_standard_set',
    );
    expect(await code(saveStandardLinks({ root, bookId: 'r7', body: links(null) }))).toBe(
      '400 no_standard_set',
    );
    const unknown = links(id, { topics: { '1.1': ['9-9.9.9'] } });
    expect(await code(saveStandardLinks({ root, bookId: 'r7', body: unknown }))).toBe(
      '400 unknown_standard',
    );
    // Clearing the standard set with no links is fine.
    const cleared = links(null, { topics: {}, items: [] });
    expect(await code(saveStandardLinks({ root, bookId: 'r7', body: cleared }))).toBe('ok');
  });

  it('keeps a saved link to a standard later removed from the standard set', async () => {
    await book();
    const { id } = await createStandardSet({ root, body: input });
    await saveStandardLinks({ root, bookId: 'r7', body: links(id) });
    await saveStandardSet({ root, id, body: { ...input, standards: standards.slice(1) } });
    // 7-1.1.1 is gone from the standard set but was linked already: other edits still save.
    const edited = links(id, { topics: { '1.1': ['7-1.1.1'], '1.2': ['7-1.1.2'] } });
    expect(await code(saveStandardLinks({ root, bookId: 'r7', body: edited }))).toBe('ok');
    // Once nothing links it any more, it is unknown like any other code.
    await saveStandardLinks({ root, bookId: 'r7', body: links(id, { topics: {}, items: [] }) });
    expect(await code(saveStandardLinks({ root, bookId: 'r7', body: edited }))).toBe(
      '400 unknown_standard',
    );
  });

  it('refuses to delete a standard set a book links to', async () => {
    await book();
    const { id } = await createStandardSet({ root, body: input });
    await saveStandardLinks({ root, bookId: 'r7', body: links(id) });
    expect(await code(deleteStandardSet({ root, id }))).toBe('409 standard_set_in_use');
    await saveStandardLinks({ root, bookId: 'r7', body: links(null, { topics: {}, items: [] }) });
    expect(await code(deleteStandardSet({ root, id }))).toBe('ok');
  });
});

describe('files saved before the rename', () => {
  it('reads legacy standard sets and links, saves to the new places and deletes both copies', async () => {
    await book();
    const legacy = { id: 'arti-7-abc123', ...input, updatedAt: 't' };
    await put('.curricula/arti-7-abc123.json', legacy);
    await put('r7/curriculum-links.json', {
      curriculumId: 'arti-7-abc123',
      topics: { '1.1': ['7-1.1.1'] },
      items: [],
      updatedAt: 't',
    });
    let index = await buildContentIndex(root);
    expect(index.standardSets.map((s) => [s.id, s.path])).toEqual([
      ['arti-7-abc123', '.curricula/arti-7-abc123.json'],
    ]);
    expect(index.books[0]?.standardLinks).toMatchObject({
      standardSetId: 'arti-7-abc123',
      topics: { '1.1': ['7-1.1.1'] },
    });

    // Saving writes the new locations; the legacy files stay as they were.
    await saveStandardSet({ root, id: 'arti-7-abc123', body: input, now });
    await saveStandardLinks({
      root,
      bookId: 'r7',
      body: { standardSetId: 'arti-7-abc123', topics: { '1.2': ['7-1.1.2'] }, items: [] },
      now,
    });
    index = await buildContentIndex(root);
    expect(index.standardSets.map((s) => s.path)).toEqual(['.standards/arti-7-abc123.json']);
    expect(index.books[0]?.standardLinks?.topics).toEqual({ '1.2': ['7-1.1.2'] });
    expect(await read('.curricula/arti-7-abc123.json')).toEqual(legacy);
    expect(await read('r7/curriculum-links.json')).toMatchObject({ curriculumId: 'arti-7-abc123' });

    await saveStandardLinks({
      root,
      bookId: 'r7',
      body: { standardSetId: null, topics: {}, items: [] },
    });
    await deleteStandardSet({ root, id: 'arti-7-abc123' });
    expect(await readdir(join(root, '.curricula'))).toEqual([]);
    expect(await readdir(join(root, '.standards'))).toEqual([]);
  });
});
