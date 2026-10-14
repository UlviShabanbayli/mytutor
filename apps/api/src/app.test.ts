import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  apiErrorSchema,
  healthResponseSchema,
  practiceTestSchema,
  subjectSchema,
} from '@mytutor/schemas';
import type { PublishedTests } from '@mytutor/types';
import { createApp } from './app';

const published: PublishedTests = {
  schemaVersion: 1,
  subject: {
    id: 'riyaziyyat',
    title: 'Riyaziyyat',
    icon: 'calculator',
    topicCount: 1,
    questionCount: 2,
  },
  topics: [
    { id: 't_1', subjectId: 'riyaziyyat', title: 'Natural ədədlər', grade: null, questionCount: 2 },
  ],
  tests: [
    {
      id: 't_1',
      topicId: 't_1',
      subjectId: 'riyaziyyat',
      title: 'Natural ədədlər',
      questions: [
        {
          id: 'q_1',
          topicId: 't_1',
          type: 'choice',
          stem: '$2^{3}$ neçədir?',
          options: ['6', '8', '9', '5', '3'].map((text, i) => ({ key: 'ABCDE'[i] as 'A', text })),
          correctKey: 'B',
          answer: null,
          explanation: null,
          figures: ['media/q_1-1.png'],
          source: { kind: 'test_bank', title: 'Toplu', section: 'Natural ədədlər', page: 4 },
        },
        {
          id: 'q_2',
          topicId: 't_1',
          type: 'open',
          stem: '12 və 18-in ƏBOB-unu tapın.',
          options: [],
          correctKey: null,
          answer: '6',
          explanation: null,
          figures: [],
          source: { kind: 'test_bank', title: 'Toplu', section: 'Natural ədədlər', page: 4 },
        },
      ],
      math: { '2^{3}': { svg: '<svg></svg>', width: 1, height: 1, depth: 0 } },
    },
  ],
  publishedAt: '2026-10-15T00:00:00.000Z',
};

let contentDir: string;
beforeAll(async () => {
  contentDir = await mkdtemp(join(tmpdir(), 'mytutor-api-'));
  await mkdir(join(contentDir, '.published', 'tests'), { recursive: true });
  await mkdir(join(contentDir, '.published', 'media'), { recursive: true });
  await writeFile(
    join(contentDir, '.published', 'tests', 'riyaziyyat.json'),
    JSON.stringify(published),
  );
  await writeFile(
    join(contentDir, '.published', 'media', 'q_1-1.png'),
    Buffer.from([137, 80, 78, 71]),
  );
});
afterAll(async () => {
  await rm(contentDir, { recursive: true, force: true });
});

describe('api', () => {
  const app = () => createApp({ contentDir });

  it('GET /health returns ok', async () => {
    const res = await app().request('/health');
    expect(res.status).toBe(200);
    expect(healthResponseSchema.parse(await res.json()).status).toBe('ok');
  });

  it('unknown routes return a structured 404', async () => {
    const res = await app().request('/does-not-exist');
    expect(res.status).toBe(404);
    expect(apiErrorSchema.parse(await res.json()).error.code).toBe('not_found');
  });

  it('serves the published subjects, topics and tests', async () => {
    const subjects = subjectSchema
      .array()
      .parse(await (await app().request('/tests/subjects')).json());
    expect(subjects.map((s) => s.id)).toEqual(['riyaziyyat']);
    const subject = (await (await app().request('/tests/subjects/riyaziyyat')).json()) as {
      topics: { id: string }[];
    };
    expect(subject.topics.map((t) => t.id)).toEqual(['t_1']);
    const test = practiceTestSchema.parse(await (await app().request('/tests/t_1')).json());
    expect(test.questions.map((q) => q.type)).toEqual(['choice', 'open']);
    expect((await app().request('/tests/nope')).status).toBe(404);
    expect(((await (await app().request('/tests/recommended')).json()) as { id: string }).id).toBe(
      't_1',
    );
  });

  it('serves published figures and nothing else from disk', async () => {
    const res = await app().request('/media/q_1-1.png');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('image/png');
    expect((await app().request('/media/..%2Ftests%2Friyaziyyat.json')).status).toBe(404);
    expect((await app().request('/media/missing.png')).status).toBe(404);
  });
});
