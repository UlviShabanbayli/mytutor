import { renameSync } from 'node:fs';
import type * as FsPromises from 'node:fs/promises';
import { mkdir, mkdtemp, readdir, readFile, rename, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buildContentIndex, scanBooks, trashMetaSchema } from './contentIndex';
import {
  addBook,
  type CliRunner,
  deleteBook,
  extractSource,
  PipelineError,
  restoreBook,
  safePdfName,
} from './pipeline';

/** When armed, the next move into the trash waits until `open()`: a delete holding its lock. */
const trashGate = vi.hoisted(() => ({ armed: false, reached: () => {}, open: () => {} }));
vi.mock('node:fs/promises', async (importOriginal) => {
  const fs = await importOriginal<typeof FsPromises>();
  return {
    ...fs,
    rename: async (from: string, to: string) => {
      if (trashGate.armed && to.includes('.trash')) {
        trashGate.armed = false;
        await new Promise<void>((resolve) => {
          trashGate.open = resolve;
          trashGate.reached();
        });
      }
      return fs.rename(from, to);
    },
  };
});

const PDF = Buffer.from('%PDF-1.7\n%fake textbook\n');
const body = (bytes: Buffer) => Readable.from([bytes]);
const structure = (file: string, topics: string[]) => ({
  source: { file, pageCount: 10, printedPageOffset: 0 },
  units: [
    {
      index: 1,
      title: 'Bölmə',
      startPage: 1,
      endPage: 10,
      items: topics.map((number) => ({
        type: 'topic',
        number,
        title: `Mövzu ${number}`,
        startPage: 1,
        endPage: 2,
        sections: [],
      })),
    },
  ],
  backMatter: [],
  validation: { tocTopicCounts: [], detectedTopicCounts: [], warnings: [] },
});

/** Records calls and writes what the real CLIs would. */
function fakeRunner(topics = ['1.1', '1.2']) {
  const calls: [string, string[]][] = [];
  const run: CliRunner = async (cli, args) => {
    calls.push([cli, args]);
    const out = args[args.indexOf('--out') + 1] ?? '';
    const pdf = args[0] ?? '';
    await mkdir(out, { recursive: true });
    if (cli === 'split')
      await writeFile(
        join(out, 'structure.json'),
        JSON.stringify(structure(pdf.split('/').pop() ?? '', topics)),
      );
    else
      await writeFile(
        join(out, 'source.json'),
        JSON.stringify({ book: { file: pdf.split('/').pop() }, topic: { number: args[2] } }),
      );
  };
  return { run, calls };
}

/** A source extraction that holds its lock until `release()` is called. */
function heldExtraction(run: CliRunner) {
  let release = () => {};
  let started = () => {};
  const running = new Promise<void>((resolve) => {
    started = resolve;
  });
  const slow: CliRunner = (cli, args) =>
    new Promise<void>((resolve) => {
      release = () => void run(cli, args).then(resolve);
      started();
    });
  return { slow, running, release: () => release() };
}

let root = '';
beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'mytutor-pipeline-'));
});

const code = async (promise: Promise<unknown>) => {
  try {
    await promise;
    return 'ok';
  } catch (error) {
    return error instanceof PipelineError ? `${error.status} ${error.code}` : String(error);
  }
};

describe('safePdfName', () => {
  it.each([
    ['Riyaziyyat 7-ci sinif.pdf', 'Riyaziyyat-7-ci-sinif.pdf'],
    ['Həndəsə – şagird üçün.PDF', 'Hendese-sagird-ucun.pdf'],
    ['../../etc/passwd.pdf', 'passwd.pdf'],
    ['C:\\books\\fizika.pdf', 'fizika.pdf'],
  ])('%s → %s', (name, expected) => {
    expect(safePdfName(name)).toBe(expected);
  });

  it('rejects names that are not PDFs or have nothing usable', () => {
    expect(safePdfName('kitab.docx')).toBeNull();
    expect(safePdfName('….pdf')).toBeNull();
  });
});

describe('addBook', () => {
  it('stores the PDF, splits it and writes book.json', async () => {
    const { run, calls } = fakeRunner();
    const result = await addBook({
      root,
      fileName: 'Riyaziyyat 7.pdf',
      title: '  Riyaziyyat\n7 ',
      body: body(PDF),
      run,
    });
    expect(result).toEqual({ bookId: 'Riyaziyyat-7' });
    const dir = join(root, 'Riyaziyyat-7');
    expect((await readdir(dir)).sort()).toEqual([
      'Riyaziyyat-7.pdf',
      'book.json',
      'structure.json',
    ]);
    expect(JSON.parse(await readFile(join(dir, 'book.json'), 'utf8'))).toEqual({
      title: 'Riyaziyyat 7',
      pdf: 'Riyaziyyat-7.pdf',
    });
    // The split ran in the staging folder that then became the book folder.
    expect(calls).toHaveLength(1);
    expect(calls[0]?.[0]).toBe('split');
    expect(calls[0]?.[1][0]).toMatch(/\.incoming-[^/]+\/Riyaziyyat-7\.pdf$/);
    const [book] = await scanBooks(root);
    expect(book).toMatchObject({
      id: 'Riyaziyyat-7',
      title: 'Riyaziyyat 7',
      canExtract: true,
      topics: [],
    });
  });

  it('refuses a file without the PDF signature and leaves nothing behind', async () => {
    const { run, calls } = fakeRunner();
    const result = code(
      addBook({ root, fileName: 'x.pdf', title: 'X', body: body(Buffer.from('hello')), run }),
    );
    expect(await result).toBe('400 not_pdf');
    expect(calls).toEqual([]);
    expect(await readdir(root)).toEqual([]);
  });

  it('refuses a second book with the same file name', async () => {
    const { run } = fakeRunner();
    await addBook({ root, fileName: 'a.pdf', title: 'A', body: body(PDF), run });
    expect(await code(addBook({ root, fileName: 'a.pdf', title: 'A', body: body(PDF), run }))).toBe(
      '409 exists',
    );
  });

  it('refuses a readable PDF that is not a textbook (no topics) and leaves nothing behind', async () => {
    const { run } = fakeRunner([]);
    expect(await code(addBook({ root, fileName: 'a.pdf', title: 'A', body: body(PDF), run }))).toBe(
      '422 not_textbook',
    );
    expect(await readdir(root)).toEqual([]);
    // …so the right file can be uploaded under the same name afterwards.
    expect(
      await addBook({
        root,
        fileName: 'a.pdf',
        title: 'A',
        body: body(PDF),
        run: fakeRunner().run,
      }),
    ).toEqual({
      bookId: 'a',
    });
  });

  it('builds the book in a hidden staging folder the index ignores', async () => {
    let seen: string[] = [];
    const { run } = fakeRunner();
    const spy: CliRunner = async (cli, args) => {
      await run(cli, args);
      seen = (await scanBooks(root)).map((b) => b.id);
    };
    await addBook({ root, fileName: 'a.pdf', title: 'A', body: body(PDF), run: spy });
    expect(seen).toEqual([]);
    expect(await readdir(root)).toEqual(['a']);
  });

  it('treats names that differ only in case as the same book', async () => {
    const { run } = fakeRunner();
    await addBook({ root, fileName: 'Kitab.pdf', title: 'A', body: body(PDF), run });
    expect(
      await code(addBook({ root, fileName: 'kitab.pdf', title: 'B', body: body(PDF), run })),
    ).toBe('409 exists');
  });

  it('cleans up when splitting fails', async () => {
    const run: CliRunner = () => Promise.reject(new Error('Mündəricat tapılmadı'));
    expect(await code(addBook({ root, fileName: 'a.pdf', title: 'A', body: body(PDF), run }))).toBe(
      '422 split_failed',
    );
    expect(await readdir(root)).toEqual([]);
  });

  it('validates name and title before reading the upload', async () => {
    const { run } = fakeRunner();
    expect(await code(addBook({ root, fileName: 'a.txt', title: 'A', body: body(PDF), run }))).toBe(
      '400 bad_name',
    );
    expect(
      await code(addBook({ root, fileName: 'a.pdf', title: '   ', body: body(PDF), run })),
    ).toBe('400 bad_title');
  });
});

describe('extractSource', () => {
  it('runs the source CLI into the book folder for a known topic', async () => {
    const { run, calls } = fakeRunner();
    await addBook({ root, fileName: 'a.pdf', title: 'A', body: body(PDF), run });
    expect(await extractSource({ root, bookId: 'a', topic: '1.2', run })).toEqual({
      bookId: 'a',
      topic: '1.2',
    });
    const dir = join(root, 'a');
    expect(calls.at(-1)).toEqual([
      'source',
      [join(dir, 'a.pdf'), '--topic', '1.2', '--out', join(dir, 'topics', '1.2')],
    ]);
    const [book] = await scanBooks(root);
    expect(book?.topics.map((t) => t.number)).toEqual(['1.2']);
  });

  it('refuses unknown books, unknown topics and malformed numbers', async () => {
    const { run } = fakeRunner();
    await addBook({ root, fileName: 'a.pdf', title: 'A', body: body(PDF), run });
    expect(await code(extractSource({ root, bookId: 'b', topic: '1.1', run }))).toBe('404 no_book');
    expect(await code(extractSource({ root, bookId: 'a', topic: '9.9', run }))).toBe(
      '404 no_topic',
    );
    expect(await code(extractSource({ root, bookId: 'a', topic: '../x', run }))).toBe(
      '400 bad_topic',
    );
  });

  it('needs the PDF on disk', async () => {
    await mkdir(join(root, 'old'), { recursive: true });
    await writeFile(
      join(root, 'old', 'structure.json'),
      JSON.stringify(structure('old.pdf', ['1.1'])),
    );
    expect(
      await code(extractSource({ root, bookId: 'old', topic: '1.1', run: fakeRunner().run })),
    ).toBe('409 no_pdf');
  });

  it('runs one extraction per topic at a time', async () => {
    const { run } = fakeRunner();
    await addBook({ root, fileName: 'a.pdf', title: 'A', body: body(PDF), run });
    const held = heldExtraction(run);
    const first = extractSource({ root, bookId: 'a', topic: '1.1', run: held.slow });
    await held.running; // the lock is held from here until release()
    expect(await code(extractSource({ root, bookId: 'a', topic: '1.1', run }))).toBe('409 busy');
    held.release();
    await first;
  });
});

const AT = new Date('2026-10-10T18:15:00.000Z');

/** Book "a" in its upload folder plus an older folder with a topic source and knowledge. */
async function twoFolderBook() {
  const { run } = fakeRunner();
  await addBook({ root, fileName: 'a.pdf', title: 'A', body: body(PDF), run });
  await addBook({ root, fileName: 'b.pdf', title: 'B', body: body(PDF), run });
  await mkdir(join(root, 'old-a', 'topics', '1.1', 'knowledge'), { recursive: true });
  await writeFile(
    join(root, 'old-a', 'topics', '1.1', 'source.json'),
    JSON.stringify({ book: { file: 'a.pdf' }, topic: { number: '1.1' } }),
  );
  await writeFile(join(root, 'old-a', 'topics', '1.1', 'knowledge', 'knowledge.json'), '{}');
  return run;
}

describe('deleteBook', () => {
  it('moves every folder of the book to the trash, which the index lists', async () => {
    await twoFolderBook();
    const { trashId } = await deleteBook({ root, bookId: 'a', now: () => AT });
    expect(trashId).toMatch(/^2026-10-10T18-15-00-000Z-a-\w+$/);
    expect((await readdir(root)).sort()).toEqual(['.trash', 'b']);
    const entry = join(root, '.trash', trashId);
    expect((await readdir(entry)).sort()).toEqual(['a', 'old-a', 'trash.json']);
    // Nothing was erased: the PDF and the knowledge document moved with their folders.
    expect(await readdir(join(entry, 'a'))).toContain('a.pdf');
    expect(await readdir(join(entry, 'old-a', 'topics', '1.1', 'knowledge'))).toEqual([
      'knowledge.json',
    ]);
    const index = await buildContentIndex(root);
    expect(index.books.map((b) => b.id)).toEqual(['b']);
    expect(index.trash).toEqual([
      {
        id: trashId,
        bookId: 'a',
        title: 'A',
        deletedAt: AT.toISOString(),
        sourceCount: 1,
        knowledgeCount: 1,
      },
    ]);
  });

  it('refuses a book whose folder also holds another book, and moves nothing', async () => {
    const { run } = fakeRunner();
    await addBook({ root, fileName: 'a.pdf', title: 'A', body: body(PDF), run });
    await mkdir(join(root, 'mixed', 'topics', '1.1'), { recursive: true });
    await writeFile(
      join(root, 'mixed', 'structure.json'),
      JSON.stringify(structure('c.pdf', ['1.1'])),
    );
    await writeFile(
      join(root, 'mixed', 'topics', '1.1', 'source.json'),
      JSON.stringify({ book: { file: 'a.pdf' }, topic: { number: '1.1' } }),
    );
    expect(await code(deleteBook({ root, bookId: 'a' }))).toBe('409 shared_folder');
    expect((await readdir(root)).sort()).toEqual(['a', 'mixed']);
  });

  it("refuses when another book's book.json and PDF share the folder, and moves nothing", async () => {
    const { run } = fakeRunner();
    await addBook({ root, fileName: 'a.pdf', title: 'A', body: body(PDF), run });
    await mkdir(join(root, 'x', 'topics', '1.1'), { recursive: true });
    await writeFile(join(root, 'x', 'c.pdf'), PDF);
    await writeFile(join(root, 'x', 'book.json'), JSON.stringify({ title: 'C', pdf: 'c.pdf' }));
    await writeFile(
      join(root, 'x', 'topics', '1.1', 'source.json'),
      JSON.stringify({ book: { file: 'a.pdf' }, topic: { number: '1.1' } }),
    );
    expect(await code(deleteBook({ root, bookId: 'a' }))).toBe('409 shared_folder');
    expect((await readdir(root)).sort()).toEqual(['a', 'x']);
  });

  it('puts every folder back and leaves no trash entry when a move fails', async () => {
    await twoFolderBook();
    // `now` runs between the scan and the moves: "old-a" vanishes, so its move fails after "a"
    // has moved.
    const now = () => {
      renameSync(join(root, 'old-a'), join(root, '.parked'));
      return AT;
    };
    expect(await code(deleteBook({ root, bookId: 'a', now }))).toMatch(/ENOENT/);
    expect((await readdir(root)).sort()).toEqual(['.parked', '.trash', 'a', 'b']);
    expect(await readdir(join(root, '.trash'))).toEqual([]);
  });

  it('refuses an unknown book', async () => {
    expect(await code(deleteBook({ root, bookId: 'nope' }))).toBe('404 no_book');
  });

  it('waits for a running extraction of the book, and extraction waits for a delete', async () => {
    const { run } = fakeRunner();
    await addBook({ root, fileName: 'a.pdf', title: 'A', body: body(PDF), run });
    const held = heldExtraction(run);
    const first = extractSource({ root, bookId: 'a', topic: '1.1', run: held.slow });
    await held.running;
    expect(await code(deleteBook({ root, bookId: 'a' }))).toBe('409 busy');
    held.release();
    await first;
    const { run: extractRun, calls } = fakeRunner();
    const reached = new Promise<void>((resolve) => {
      trashGate.reached = resolve;
    });
    trashGate.armed = true;
    const deleting = deleteBook({ root, bookId: 'a' });
    await reached; // the delete holds the book lock, its folder not yet moved
    try {
      expect(await code(extractSource({ root, bookId: 'a', topic: '1.1', run: extractRun }))).toBe(
        '409 busy',
      );
      expect(calls).toEqual([]);
    } finally {
      // Released even if an assertion fails, so the lock does not leak into later tests.
      trashGate.open();
      await deleting;
    }
    expect(await code(extractSource({ root, bookId: 'a', topic: '1.1', run }))).toBe('404 no_book');
  });
});

describe('restoreBook', () => {
  it('puts the folders back where they were and empties the trash entry', async () => {
    await twoFolderBook();
    const before = await buildContentIndex(root);
    const { trashId } = await deleteBook({ root, bookId: 'a' });
    expect(await restoreBook({ root, trashId })).toEqual({ bookId: 'a' });
    expect(await buildContentIndex(root)).toEqual(before);
    expect(await readdir(join(root, '.trash'))).toEqual([]);
    // The restored book works as before.
    expect(await extractSource({ root, bookId: 'a', topic: '1.2', run: fakeRunner().run })).toEqual(
      { bookId: 'a', topic: '1.2' },
    );
  });

  it('refuses when the book was added again, and keeps the entry', async () => {
    const run = await twoFolderBook();
    const { trashId } = await deleteBook({ root, bookId: 'a' });
    await addBook({ root, fileName: 'a.pdf', title: 'A again', body: body(PDF), run });
    expect(await code(restoreBook({ root, trashId }))).toBe('409 restore_conflict');
    expect((await buildContentIndex(root)).trash.map((e) => e.id)).toEqual([trashId]);
  });

  it('refuses when the book was added again into a folder of another name', async () => {
    const { run } = fakeRunner();
    await mkdir(join(root, 'cli-a', 'topics', '1.1'), { recursive: true });
    await writeFile(
      join(root, 'cli-a', 'structure.json'),
      JSON.stringify(structure('a.pdf', ['1.1'])),
    );
    await writeFile(
      join(root, 'cli-a', 'topics', '1.1', 'source.json'),
      JSON.stringify({ book: { file: 'a.pdf' }, topic: { number: '1.1' } }),
    );
    const { trashId } = await deleteBook({ root, bookId: 'a' });
    await addBook({ root, fileName: 'a.pdf', title: 'A again', body: body(PDF), run });
    expect(await code(restoreBook({ root, trashId }))).toBe('409 restore_conflict');
    expect((await readdir(root)).sort()).toEqual(['.trash', 'a']);
  });

  it('refuses when a folder of the book is taken, and moves nothing', async () => {
    await twoFolderBook();
    const { trashId } = await deleteBook({ root, bookId: 'a' });
    await mkdir(join(root, 'old-a'));
    await writeFile(join(root, 'old-a', 'notes.txt'), 'unrelated');
    expect(await code(restoreBook({ root, trashId }))).toBe('409 restore_conflict');
    expect((await readdir(join(root, '.trash', trashId))).sort()).toEqual([
      'a',
      'old-a',
      'trash.json',
    ]);
    expect((await readdir(root)).sort()).toEqual(['.trash', 'b', 'old-a']);
  });

  it('restores a book whose delete stopped after the first folder moved', async () => {
    await twoFolderBook();
    const before = await buildContentIndex(root);
    const { trashId } = await deleteBook({ root, bookId: 'a' });
    // Folders move in name order: `a` reached the trash, `old-a` did not.
    await rename(join(root, '.trash', trashId, 'old-a'), join(root, 'old-a'));
    expect(await restoreBook({ root, trashId })).toEqual({ bookId: 'a' });
    expect(await buildContentIndex(root)).toEqual(before);
  });

  it('refuses unknown, hidden and path-like ids', async () => {
    for (const trashId of ['nope', '.trash', '..', '../a', 'a/b'])
      expect(await code(restoreBook({ root, trashId }))).toBe('404 no_trash');
  });

  it('refuses an entry whose trash.json names hidden or path-like folders, and moves nothing', async () => {
    await twoFolderBook();
    const { trashId } = await deleteBook({ root, bookId: 'a' });
    const entry = join(root, '.trash', trashId);
    const meta = trashMetaSchema.parse(
      JSON.parse(await readFile(join(entry, 'trash.json'), 'utf8')),
    );
    // A planted hidden folder: a regression shows up inside the test's root, never outside it.
    await mkdir(join(entry, '.incoming-1'));
    for (const folders of [['../x'], ['.incoming-1']]) {
      await writeFile(join(entry, 'trash.json'), JSON.stringify({ ...meta, folders }));
      expect(await code(restoreBook({ root, trashId }))).toBe('404 no_trash');
    }
    expect((await readdir(root)).sort()).toEqual(['.trash', 'b']);
  });

  it('refuses a second restore of the same entry', async () => {
    await twoFolderBook();
    const { trashId } = await deleteBook({ root, bookId: 'a' });
    await restoreBook({ root, trashId });
    expect(await code(restoreBook({ root, trashId }))).toBe('404 no_trash');
  });
});
