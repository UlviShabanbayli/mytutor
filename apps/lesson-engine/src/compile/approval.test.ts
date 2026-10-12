import { itemFingerprint, lessonScenarioSchema } from '@mytutor/schemas';
import type { KnowledgeDocument, TopicReview } from '@mytutor/types';
import { describe, expect, it } from 'vitest';
import { unapprovedSources } from './approval';

const item = (id: string, statement: string) => ({
  id,
  type: 'rule' as const,
  content: { statement, latex: null },
});

describe('unapprovedSources', () => {
  const items = [item('k001', 'Birinci qayda.'), item('k002', 'İkinci qayda.')];
  const doc = { items } as unknown as KnowledgeDocument;
  const scenario = lessonScenarioSchema.parse({
    schemaVersion: 1,
    id: 'scv_abcdefghij',
    version: 1,
    status: 'draft',
    topic: { bookId: 'book', number: '1.1', title: 'Rasional ədədlər' },
    source: { title: 'Riyaziyyat 7', printedPages: [9] },
    author: 'test',
    createdAt: '2026-10-12T00:00:00.000Z',
    scenes: [
      {
        id: 'one',
        narration: 'Qaydalar.',
        board: [{ kind: 'text', text: 'Birinci qayda.', sources: ['k001'] }],
        sources: ['k001', 'k002', 'k009'],
      },
    ],
  });
  const decided = (id: string, statement: string, decision: 'approved' | 'rejected') => ({
    itemId: id,
    fingerprint: itemFingerprint(item(id, statement)),
    decision,
    note: null,
    decidedAt: '2026-10-12T00:00:00.000Z',
  });

  it('names cited items the topic lacks and those no editor approved', () => {
    const review: TopicReview = {
      items: [
        decided('k001', 'Birinci qayda.', 'approved'),
        decided('k002', 'İkinci qayda.', 'rejected'),
      ],
      blocks: [],
      updatedAt: '2026-10-12T00:00:00.000Z',
    };
    expect(unapprovedSources(scenario, doc, review)).toEqual({
      missing: ['k009'],
      unapproved: ['k002'],
    });
  });

  it('does not count a decision made on an older version of an item', () => {
    const review: TopicReview = {
      items: [decided('k001', 'Köhnə mətn.', 'approved')],
      blocks: [],
      updatedAt: '2026-10-12T00:00:00.000Z',
    };
    expect(unapprovedSources(scenario, doc, review).unapproved).toEqual(['k001', 'k002']);
  });
});
