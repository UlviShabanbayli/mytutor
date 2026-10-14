import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { itemFingerprint } from '@mytutor/schemas';
import type { KnowledgeDocument, KnowledgeItem } from '@mytutor/types';
import { buildContentIndex } from './contentIndex';
import { decideLessonDraft, estimateLessonTextCost, writeLessonText } from './lessons';
import { PipelineError } from './pipeline';

let root = '';
beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'mytutor-lessons-'));
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

const region = { page: 11, printedPage: 9, bbox: { x: 0, y: 0, width: 1, height: 1 } };
const item = (id: string, type: KnowledgeItem['type'], content: object): KnowledgeItem => ({
  id,
  type,
  status: 'textbook',
  claimedOrigin: 'textbook',
  readFrom: 'text',
  sources: [{ blockId: 'b01', lineIds: [], figureId: null, regions: [region], crops: [] }],
  content: content as Record<string, unknown>,
  checks: [],
});
const rule = item('k001', 'rule', { statement: 'Əks ədədlərin modulları bərabərdir.' });
const exercise = item('k002', 'exercise', { number: '1', instruction: 'Tapın.', items: [] });
const pending = item('k003', 'rule', { statement: 'Hələ təsdiqlənməyib.' });
const doc: KnowledgeDocument = {
  schemaVersion: 1,
  extractionVersion: 2,
  topic: { number: '1.1', title: 'Rasional ədədlər' },
  source: { bookSha256: 'a', parserVersion: '0', sourceSha256: 'b' },
  prompts: { extract: 'e', verify: 'v', extractSha256: 'e', verifySha256: 'v' },
  createdAt: '2026-10-14T00:00:00.000Z',
  items: [rule, exercise, pending],
  aiCalls: [],
  summary: {
    textbook: 3,
    derived: 0,
    unverified: 0,
    imageBasedFormulas: [],
    rejected: 0,
    costUsd: 0,
  },
};
const approved = (i: KnowledgeItem) => ({
  itemId: i.id,
  fingerprint: itemFingerprint(i),
  decision: 'approved' as const,
  note: null,
  decidedAt: '2026-10-14T00:00:00.000Z',
});
const CUR = 'cur_abcdefghij';
const ref = () => ({ root, curriculumId: CUR, bookId: 'r7', number: '1.1' });

/** Curriculum CUR with book "r7", whose topic 1.1 has two approved items of three. */
async function setup() {
  await put('r7/topics/1.1/source.json', {
    book: { file: 'r7.pdf' },
    topic: {
      number: '1.1',
      title: 'Rasional ədədlər',
      unit: { index: 1, title: 'Rasional ədədlər' },
    },
  });
  await put('r7/topics/1.1/knowledge/knowledge.json', doc);
  await put('r7/topics/1.1/review.json', {
    items: [approved(rule), approved(exercise)],
    blocks: [],
    updatedAt: '2026-10-14T00:00:00.000Z',
  });
  await put(`.curricula/${CUR}/curriculum.json`, {
    schemaVersion: 1,
    id: CUR,
    title: 'Riyaziyyat 7',
    subject: 'Riyaziyyat',
    grade: 7,
    textbooks: [{ bookId: 'r7', addedAt: '2026-10-14T00:00:00.000Z' }],
    createdAt: '2026-10-14T00:00:00.000Z',
    updatedAt: '2026-10-14T00:00:00.000Z',
  });
}

/** A client whose one answer is `output`, recording the request it got. */
function fakeClient(output: unknown) {
  const stream = vi.fn((_request: { messages: { content: { text: string }[] }[] }) => ({
    finalMessage: async () => ({
      stop_reason: 'end_turn',
      model: 'claude-opus-5-5',
      content: [{ type: 'text', text: JSON.stringify(output) }],
      usage: {
        input_tokens: 1000,
        output_tokens: 2000,
        cache_creation_input_tokens: 0,
        cache_read_input_tokens: 0,
      },
    }),
  }));
  return { client: { beta: { messages: { stream } } } as never, stream };
}

const text = (sources: string[]) => ({
  sections: [
    { heading: 'Modul', paragraphs: [{ text: 'Əks ədədlər üçün $|a| = |-a|$.', sources }] },
  ],
});
const at = (iso: string) => () => new Date(iso);
const lessonPath = () => join(root, `.curricula/${CUR}/lessons/r7/1.1/lesson.json`);

describe('lesson text', () => {
  it('estimates the cost from the approved items, not exercises or undecided ones', async () => {
    await setup();
    const estimate = await estimateLessonTextCost(ref());
    expect(estimate).toMatchObject({ items: 1, model: 'claude-opus-5-5' });
    expect(estimate.costUsd).toBeGreaterThan(0);
  });

  it('writes a draft, keeps it apart, and approving makes it the lesson text', async () => {
    await setup();
    const { client, stream } = fakeClient(text(['k001']));
    await writeLessonText({ ...ref(), client, now: at('2026-10-14T10:00:00.000Z') });
    const sent = stream.mock.calls[0]?.[0].messages[0]?.content[0]?.text ?? '';
    expect(sent).toContain('"id":"k001"');
    expect(sent).not.toContain('k002');
    expect(sent).not.toContain('k003');

    let lesson = JSON.parse(await readFile(lessonPath(), 'utf8'));
    expect(lesson.text).toBeNull();
    expect(lesson.draft).toMatchObject({
      itemFingerprints: { k001: itemFingerprint(rule) },
      approvedAt: null,
    });
    expect(lesson.id).toMatch(/^lesson_[a-z0-9]{10}$/);
    const index = await buildContentIndex(root);
    expect(index.curricula[0]?.lessons).toMatchObject([
      { bookId: 'r7', number: '1.1', text: false, draft: true },
    ]);

    await decideLessonDraft({ ...ref(), approve: true, now: at('2026-10-14T11:00:00.000Z') });
    lesson = JSON.parse(await readFile(lessonPath(), 'utf8'));
    expect(lesson.draft).toBeNull();
    expect(lesson.text).toMatchObject({ approvedAt: '2026-10-14T11:00:00.000Z' });
    expect(await code(decideLessonDraft({ ...ref(), approve: true }))).toBe('409 no_draft');
  });

  it('refuses an answer citing items it was not given', async () => {
    await setup();
    const { client } = fakeClient(text(['k002']));
    expect(await code(writeLessonText({ ...ref(), client }))).toBe('502 ai_failed');
  });

  it('needs credentials and a topic of the curriculum', async () => {
    await setup();
    expect(await code(writeLessonText({ ...ref(), client: null }))).toBe('503 no_api_key');
    expect(await code(estimateLessonTextCost({ ...ref(), bookId: 'x' }))).toBe('404 no_book');
    expect(await code(estimateLessonTextCost({ ...ref(), number: '9.9' }))).toBe('404 no_topic');
  });
});
