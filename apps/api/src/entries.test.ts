import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { bookAnswersSchema, bookLessonSchema, todayResponseSchema } from '@mytutor/schemas';
import { createNodeApp } from './nodeApp';
import { READY_BOOK_FILE } from './services/bookContent';
import worker from './worker';

// Synthetic content in the shapes the pipelines write; the text is ours, not the book's.
const BOOK_ID = READY_BOOK_FILE.replace(/\.pdf$/, '');
const lesson = {
  schemaVersion: 1,
  id: 'lesson_abcdefghij',
  topic: { bookId: BOOK_ID, number: '4.3' },
  text: {
    sections: [{ heading: 'Kub', paragraphs: [{ text: 'Sınaq mətni.', sources: ['k001'] }] }],
    itemFingerprints: {},
    model: 'test',
    promptVersion: 'test',
    costUsd: 0,
    createdAt: '2026-10-15T00:00:00.000Z',
    approvedAt: '2026-10-16T00:00:00.000Z',
  },
  draft: null,
  createdAt: '2026-10-15T00:00:00.000Z',
  updatedAt: '2026-10-16T00:00:00.000Z',
};
const answer = (id: string, page: number) => ({
  id,
  page,
  exercise: '1',
  section: null,
  parts: [{ label: null, text: '8', latex: null }],
  sourcePage: 140,
  sourcePrintedPage: 138,
  status: 'verified',
  correction: null,
});
const answers = {
  schemaVersion: 1,
  book: { file: READY_BOOK_FILE, sha256: 'x' },
  prompts: { extract: 'x', verify: 'x' },
  createdAt: '2026-10-15T00:00:00.000Z',
  answers: [answer('a1', 90), answer('a2', 93), answer('a3', 95)],
  aiCalls: [],
  summary: { answers: 3, verified: 3, mismatch: 0, costUsd: 0 },
};

let contentDir: string;
beforeAll(async () => {
  contentDir = await mkdtemp(join(tmpdir(), 'mytutor-content-'));
  const lessonDir = join(contentDir, '.curricula', 'cur_abcdefghij', 'lessons', BOOK_ID, '4.3');
  await mkdir(lessonDir, { recursive: true });
  await writeFile(join(lessonDir, 'lesson.json'), JSON.stringify(lesson));
  await mkdir(join(contentDir, 'r7', 'answers'), { recursive: true });
  await writeFile(join(contentDir, 'r7', 'answers', 'answers.json'), JSON.stringify(answers));
});
afterAll(async () => {
  await rm(contentDir, { recursive: true, force: true });
});

describe('Node entry', () => {
  it('serves approved lesson texts and the book answers on the topic’s pages', async () => {
    const { app, hasContent } = createNodeApp({ contentDir });
    expect(hasContent).toBe(true);
    const text = bookLessonSchema.parse(
      await (await app.request('/v1/lessons/riyaziyyat-7-4-3/book')).json(),
    );
    expect(text.sections[0]?.paragraphs).toEqual(['Sınaq mətni.']);
    const key = bookAnswersSchema.parse(
      await (await app.request('/v1/lessons/riyaziyyat-7-4-3/answers')).json(),
    );
    // 4.3 is printed on pages 90–93: page 95 belongs to another topic.
    expect(key.answers.map((a) => a.id)).toEqual(['a1', 'a2']);
    expect((await app.request('/v1/lessons/riyaziyyat-7-4-1/book')).status).toBe(404);
    expect((await app.request('/v1/lessons/riyaziyyat-7-6-1/answers')).status).toBe(404);
  });

  it('returns 404 for book content without a content folder, and still serves the demo', async () => {
    const { app, hasContent } = createNodeApp({ contentDir: join(contentDir, 'missing') });
    expect(hasContent).toBe(false);
    expect((await app.request('/v1/lessons/riyaziyyat-7-4-3/book')).status).toBe(404);
    expect((await app.request('/v1/lessons/riyaziyyat-7-4-3/answers')).status).toBe(404);
    expect(await (await app.request('/tests/subjects')).json()).toEqual([]);
    expect((await app.request('/v1/lessons/riyaziyyat-7-4-3')).status).toBe(200);
  });
});

describe('Worker entry', () => {
  it('serves the demo world and no book content', async () => {
    const today = todayResponseSchema.parse(await (await worker.request('/v1/today')).json());
    expect(today.studentName).toBe('Nərmin');
    expect((await worker.request('/v1/lessons/riyaziyyat-7-4-3/book')).status).toBe(404);
    expect(await (await worker.request('/tests/subjects')).json()).toEqual([]);
    expect((await worker.request('/media/q_1-1.png')).status).toBe(404);
  });

  it('imports nothing from Node or the content folder code', async () => {
    const src = dirname(fileURLToPath(import.meta.url));
    const seen = new Set<string>();
    const visit = async (file: string) => {
      if (seen.has(file)) return;
      seen.add(file);
      const code = await readFile(file, 'utf8');
      for (const [, spec = ''] of code.matchAll(/from '([^']+)'/g)) {
        expect(spec.startsWith('node:'), `${file} imports ${spec}`).toBe(false);
        if (spec.startsWith('.')) await visit(`${resolve(dirname(file), spec)}.ts`);
      }
    };
    await visit(join(src, 'worker.ts'));
    const files = [...seen].map((f) => f.slice(src.length + 1));
    expect(files).not.toContain('services/contentDir.ts');
    expect(files).not.toContain('services/bookContent.ts');
    expect(files).not.toContain('services/publishedTests.ts');
    expect(files).not.toContain('env.ts');
  });
});
