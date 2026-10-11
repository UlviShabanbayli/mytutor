import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { itemFingerprint } from '@mytutor/schemas';
import type { KnowledgeDocument, KnowledgeItem } from '@mytutor/types';
import { buildContentIndex } from './contentIndex';
import { PipelineError } from './pipeline';
import { saveTopicReview } from './review';

let root = '';
beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'mytutor-review-'));
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

const region = { page: 1, printedPage: 1, bbox: { x: 0, y: 0, width: 1, height: 1 } };
const item = (id: string, block: string, failed = false): KnowledgeItem => ({
  id,
  type: 'rule',
  status: 'textbook',
  claimedOrigin: 'textbook',
  readFrom: 'text',
  sources: [{ blockId: block, lineIds: [], figureId: null, regions: [region], crops: [] }],
  content: { statement: `Qayda ${id}` },
  checks: failed ? [{ name: 'identity', result: 'fail', detail: null }] : [],
});
const items = [item('k001', 'b01'), item('k002', 'b01', true), item('k003', 'b02')];
const doc: KnowledgeDocument = {
  schemaVersion: 1,
  extractionVersion: 2,
  topic: { number: '1.1', title: 'Mövzu' },
  source: { bookSha256: 'a', parserVersion: '0', sourceSha256: 'b' },
  prompts: { extract: 'e', verify: 'v', extractSha256: 'e', verifySha256: 'v' },
  createdAt: '2026-10-11T00:00:00.000Z',
  items,
  aiCalls: [],
  summary: {
    textbook: 3,
    derived: 0,
    unverified: 0,
    imageBasedFormulas: [],
    rejected: 0,
    costUsd: 0.5,
  },
};

/** Book "r7": topic 1.1 with knowledge, topic 1.2 with a source only. */
async function book() {
  const source = (n: string) => ({ book: { file: 'r7.pdf' }, topic: { number: n } });
  await put('r7/topics/1.1/source.json', source('1.1'));
  await put('r7/topics/1.1/knowledge/knowledge.json', doc);
  await put('r7/topics/1.2/source.json', source('1.2'));
}

const decision = (i: KnowledgeItem) => ({
  itemId: i.id,
  fingerprint: itemFingerprint(i),
  decision: 'approved' as const,
  note: null,
  decidedAt: '2026-10-11T10:00:00.000Z',
});

describe('saveTopicReview', () => {
  it('saves decisions in the topic folder and the index counts them', async () => {
    await book();
    const [k1, k2] = items as [KnowledgeItem, KnowledgeItem, KnowledgeItem];
    let [entry] = (await buildContentIndex(root)).books[0]?.topics ?? [];
    expect(entry).toMatchObject({
      summary: { items: 3, textbook: 3, derived: 0, unverified: 0, flagged: 1, costUsd: 0.5 },
      review: { blocks: 2, approvedBlocks: 0, decidedItems: 0, openFlagged: 1 },
    });

    const body = {
      items: [decision(k1), decision(k2)],
      blocks: [
        { blockId: 'b01', itemFingerprints: [k1, k2].map(itemFingerprint), approvedAt: 't' },
      ],
    };
    const at = new Date('2026-10-11T10:00:00.000Z');
    expect(
      await saveTopicReview({ root, bookId: 'r7', topic: '1.1', body, now: () => at }),
    ).toEqual({
      updatedAt: at.toISOString(),
    });
    const saved: unknown = JSON.parse(
      await readFile(join(root, 'r7/topics/1.1/review.json'), 'utf8'),
    );
    expect(saved).toEqual({ ...body, updatedAt: at.toISOString() });
    [entry] = (await buildContentIndex(root)).books[0]?.topics ?? [];
    expect(entry?.review).toEqual({
      blocks: 2,
      approvedBlocks: 1,
      decidedItems: 2,
      openFlagged: 0,
    });
  });

  it('refuses unknown books and topics, topics without knowledge and bad bodies', async () => {
    await book();
    const body = { items: [], blocks: [] };
    expect(await code(saveTopicReview({ root, bookId: 'x', topic: '1.1', body }))).toBe(
      '404 no_book',
    );
    expect(await code(saveTopicReview({ root, bookId: 'r7', topic: '9.9', body }))).toBe(
      '404 no_topic',
    );
    expect(await code(saveTopicReview({ root, bookId: 'r7', topic: '1.2', body }))).toBe(
      '409 no_knowledge',
    );
    expect(
      await code(saveTopicReview({ root, bookId: 'r7', topic: '1.1', body: { items: 'x' } })),
    ).toBe('400 bad_request');
  });
});
