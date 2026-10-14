import { mkdir, mkdtemp, readdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { buildContentIndex } from './contentIndex';
import {
  addCurriculumTextbook,
  createCurriculum,
  deleteCurriculum,
  removeCurriculumTextbook,
  saveCurriculum,
} from './curricula';
import { PipelineError } from './pipeline';

const AT = new Date('2026-10-12T09:00:00.000Z');
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

/** Book "r7", split into units and topics. */
const book = () =>
  put('r7/structure.json', { source: { file: 'r7.pdf' }, units: [] }).then(() =>
    put('r7/book.json', { title: 'Riyaziyyat 7' }),
  );

const input = { title: 'Riyaziyyat — 7-ci sinif', subject: 'Riyaziyyat', grade: 7 };

describe('curricula', () => {
  it('creates an empty curriculum with a stable id and lists it', async () => {
    const { id } = await createCurriculum({ root, body: input, now });
    expect(id).toMatch(/^cur_[a-z0-9]{10}$/);
    const file: unknown = JSON.parse(
      await readFile(join(root, '.curricula', id, 'curriculum.json'), 'utf8'),
    );
    expect(file).toEqual({
      schemaVersion: 1,
      id,
      ...input,
      textbooks: [],
      createdAt: AT.toISOString(),
      updatedAt: AT.toISOString(),
    });
    expect((await buildContentIndex(root)).curricula).toEqual([
      {
        id,
        ...input,
        textbooks: [],
        lessons: [],
        path: `.curricula/${id}/curriculum.json`,
        updatedAt: AT.toISOString(),
      },
    ]);
  });

  it('adds and removes textbooks from the library; adding twice changes nothing', async () => {
    await book();
    const { id } = await createCurriculum({ root, body: input, now });
    await addCurriculumTextbook({ root, id, body: { bookId: 'r7' }, now });
    await addCurriculumTextbook({ root, id, body: { bookId: 'r7' }, now });
    let [entry] = (await buildContentIndex(root)).curricula;
    expect(entry?.textbooks).toEqual([{ bookId: 'r7', addedAt: AT.toISOString() }]);
    expect(await code(addCurriculumTextbook({ root, id, body: { bookId: 'nope' } }))).toBe(
      '404 no_book',
    );
    await removeCurriculumTextbook({ root, id, bookId: 'r7', now });
    [entry] = (await buildContentIndex(root)).curricula;
    expect(entry?.textbooks).toEqual([]);
    // The book stays in the library.
    expect((await buildContentIndex(root)).books.map((b) => b.id)).toEqual(['r7']);
  });

  it('renames, and deletes only an empty curriculum', async () => {
    await book();
    const { id } = await createCurriculum({ root, body: input, now });
    await saveCurriculum({ root, id, body: { ...input, title: 'Riyaziyyat 7' }, now });
    expect((await buildContentIndex(root)).curricula[0]?.title).toBe('Riyaziyyat 7');
    await addCurriculumTextbook({ root, id, body: { bookId: 'r7' } });
    expect(await code(deleteCurriculum({ root, id }))).toBe('409 curriculum_not_empty');
    await removeCurriculumTextbook({ root, id, bookId: 'r7' });
    expect(await deleteCurriculum({ root, id })).toEqual({ id });
    expect(await readdir(join(root, '.curricula'))).toEqual([]);
  });

  it('refuses bad input and unknown or path-like ids', async () => {
    expect(await code(createCurriculum({ root, body: { ...input, title: ' ' } }))).toBe(
      '400 bad_request',
    );
    for (const id of ['cur_nope', '../r7', '.curricula', 'cur_ABCDEFGHIJ'])
      expect(await code(saveCurriculum({ root, id, body: input }))).toBe('404 no_curriculum');
    expect(await code(deleteCurriculum({ root, id: '../x' }))).toBe('404 no_curriculum');
  });

  it('lives beside legacy standard sets without either being taken for the other', async () => {
    await put('.curricula/arti-7-abc123.json', {
      id: 'arti-7-abc123',
      title: 'ARTİ 7',
      subject: 'Riyaziyyat',
      grade: 7,
      standards: [],
      updatedAt: 't',
    });
    const { id } = await createCurriculum({ root, body: input, now });
    const index = await buildContentIndex(root);
    expect(index.curricula.map((c) => c.id)).toEqual([id]);
    expect(index.standardSets.map((s) => s.id)).toEqual(['arti-7-abc123']);
  });
});
