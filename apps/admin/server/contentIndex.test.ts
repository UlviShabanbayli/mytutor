import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { buildContentIndex, resolveContentPath } from './contentIndex';

const FILE = 'riyaziyyat-7.pdf';
let root = '';

async function put(path: string, value: unknown) {
  await mkdir(join(root, path, '..'), { recursive: true });
  await writeFile(join(root, path), JSON.stringify(value));
}

beforeAll(async () => {
  root = await mkdtemp(join(tmpdir(), 'mytutor-content-'));
  // The splitter and the source extractor write to different folders for the same PDF.
  await put('split/structure.json', { source: { file: FILE }, units: [] });
  await put('riyaziyyat-7/topics/4.1/source.json', {
    book: { file: FILE },
    topic: { number: '4.1' },
  });
  await put('riyaziyyat-7/topics/4.1/knowledge/knowledge.json', {});
  await put('riyaziyyat-7/topics/4.2/source.json', { broken: true });
  await put('riyaziyyat-7/book.json', { title: 'Riyaziyyat 7' });
  // An upload in progress: never listed.
  await put('.incoming-x1/structure.json', { source: { file: 'yarim.pdf' }, units: [] });
});

describe('buildContentIndex', () => {
  it('groups outputs of one PDF from different folders', async () => {
    const index = await buildContentIndex(root);
    expect(index.books).toEqual([
      {
        id: 'riyaziyyat-7',
        file: FILE,
        title: 'Riyaziyyat 7',
        structure: 'split/structure.json',
        canExtract: false,
        topics: [
          {
            number: '4.1',
            dir: 'riyaziyyat-7/topics/4.1',
            source: 'riyaziyyat-7/topics/4.1/source.json',
            knowledge: 'riyaziyyat-7/topics/4.1/knowledge/knowledge.json',
          },
        ],
      },
    ]);
  });

  it('returns no books for a missing root', async () => {
    expect(await buildContentIndex(join(root, 'nope'))).toEqual({ books: [] });
  });
});

describe('resolveContentPath', () => {
  it('serves JSON and PNG under the root', () => {
    expect(resolveContentPath(root, '/a/source.json')).toBe(join(root, 'a/source.json'));
    expect(resolveContentPath(root, '/a/pages/p%20085.png')).toBe(join(root, 'a/pages/p 085.png'));
  });

  it('rejects paths outside the root and other file types', () => {
    expect(resolveContentPath(root, '/../secret.json')).toBeNull();
    expect(resolveContentPath(root, '/%2e%2e/secret.json')).toBeNull();
    expect(resolveContentPath(root, '/a/../../x.png')).toBeNull();
    expect(resolveContentPath(root, '/a/book.pdf')).toBeNull();
    expect(resolveContentPath(root, '/a/%00.json')).toBeNull();
    expect(resolveContentPath(root, '/%E0%A4%A')).toBeNull();
  });
});
