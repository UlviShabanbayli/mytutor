import { describe, expect, it } from 'vitest';
import { itemFingerprint } from '@mytutor/schemas';
import type { KnowledgeItem, SourceBlock, TopicReview, TopicSource } from '@mytutor/types';
import { nextOpenBlock, reviewQueue } from './queue';

const region = { page: 1, printedPage: 1, bbox: { x: 0, y: 0, width: 1, height: 1 } };
const block = (id: string): SourceBlock =>
  ({
    id,
    kind: 'section',
    regions: [region],
    crops: [],
    figureIds: [],
    lineIds: [],
  }) as unknown as SourceBlock;
const item = (id: string, blockId: string, failed = false): KnowledgeItem => ({
  id,
  type: 'rule',
  status: 'textbook',
  claimedOrigin: 'textbook',
  readFrom: 'text',
  sources: [{ blockId, lineIds: [], figureId: null, regions: [region], crops: [] }],
  content: { statement: id },
  checks: failed ? [{ name: 'identity', result: 'fail', detail: null }] : [],
});
const source = { blocks: [block('b01'), block('b02'), block('b03')] } as unknown as TopicSource;
const items = [item('k1', 'b02'), item('k2', 'b01', true), item('k3', 'b02'), item('k4', 'b03')];

describe('reviewQueue', () => {
  it('orders blocks as printed and counts what is open', () => {
    const { queue } = reviewQueue(source, items, null);
    expect(queue.map((b) => `${b.id}:${b.items.length}:${b.open}:${b.problems}`)).toEqual([
      'b01:1:1:1',
      'b02:2:2:0',
      'b03:1:1:0',
    ]);
  });

  it('marks approved blocks and finds the next open one', () => {
    const [k1, k2, k3] = items as [KnowledgeItem, KnowledgeItem, KnowledgeItem];
    const decided = (i: KnowledgeItem) => ({
      itemId: i.id,
      fingerprint: itemFingerprint(i),
      decision: 'approved' as const,
      note: null,
      decidedAt: 't',
    });
    const review: TopicReview = {
      items: [decided(k1), decided(k2), decided(k3)],
      blocks: [
        { blockId: 'b02', itemFingerprints: [k1, k3].map(itemFingerprint), approvedAt: 't' },
      ],
      updatedAt: 't',
    };
    const { queue, decisions } = reviewQueue(source, items, review);
    expect(queue.map((b) => b.approved)).toEqual([false, true, false]);
    expect(decisions.size).toBe(3);
    expect(nextOpenBlock(queue, 'b01')?.id).toBe('b03');
    expect(nextOpenBlock(queue, 'b03')?.id).toBe('b01');
  });
});
