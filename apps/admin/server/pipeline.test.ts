import { mkdir, mkdtemp, readdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { beforeEach, describe, expect, it } from 'vitest';
import { scanBooks } from './contentIndex';
import { addBook, type CliRunner, extractSource, PipelineError, safePdfName } from './pipeline';

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
    const first = extractSource({ root, bookId: 'a', topic: '1.1', run: slow });
    await running; // the lock is held from here until release()
    expect(await code(extractSource({ root, bookId: 'a', topic: '1.1', run }))).toBe('409 busy');
    release();
    await first;
  });
});
