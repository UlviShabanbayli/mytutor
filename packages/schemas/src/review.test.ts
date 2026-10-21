import { describe, expect, it } from 'vitest';
import type { z } from 'zod';
import type { knowledgeItemSchema } from './knowledge';
import {
  approvedBlocks,
  effectiveContent,
  itemDecisions,
  itemFingerprint,
  reviewBlocks,
  reviewProgress,
  reviewTier,
} from './review';

type Item = z.output<typeof knowledgeItemSchema>;

const region = { page: 1, printedPage: 1, bbox: { x: 0, y: 0, width: 1, height: 1 } };
const item = (id: string, block: string, text: string, extra: Partial<Item> = {}): Item => ({
  id,
  type: 'rule',
  status: 'textbook',
  claimedOrigin: 'textbook',
  readFrom: 'text',
  sources: [{ blockId: block, lineIds: [], figureId: null, regions: [region], crops: [] }],
  content: { statement: text },
  checks: [],
  ...extra,
});

const a = item('k001', 'b01', 'Bir');
const b = item('k002', 'b01', 'İki', { status: 'unverified' });
const c = item('k003', 'b02', 'Üç', {
  checks: [{ name: 'identity', result: 'fail', detail: null }],
});
const decided = (i: Item, decision: 'approved' | 'rejected' = 'approved') => ({
  itemId: i.id,
  fingerprint: itemFingerprint(i),
  decision,
  note: null,
  decidedAt: 't',
});
const approved = (block: string, items: Item[]) => ({
  blockId: block,
  itemFingerprints: items.map(itemFingerprint),
  approvedAt: 't',
});

describe('review', () => {
  it('fingerprints ignore id, status and key order', () => {
    const moved = { ...a, id: 'k009', status: 'derived' as const };
    expect(itemFingerprint(moved)).toBe(itemFingerprint(a));
    expect(itemFingerprint({ type: 'rule', content: { x: 1, y: 2 } })).toBe(
      itemFingerprint({ type: 'rule', content: { y: 2, x: 1 } }),
    );
  });

  it('groups items by their first block', () => {
    expect([...reviewBlocks([a, b, c]).keys()]).toEqual(['b01', 'b02']);
  });

  it('finds decisions by id and content, and by content after renumbering', () => {
    const renumbered = { ...b, id: 'k005' };
    const decisions = itemDecisions([a, renumbered, c], {
      items: [decided(a), decided(b)],
      blocks: [],
    });
    expect([...decisions.keys()]).toEqual(['k001', 'k005']);
  });

  it('reopens a block when one of its items changed', () => {
    const review = { items: [decided(a), decided(b)], blocks: [approved('b01', [a, b])] };
    expect([...approvedBlocks([a, b, c], review)]).toEqual(['b01']);
    const changed = { ...b, content: { statement: 'İki!' } };
    expect([...approvedBlocks([a, changed, c], review)]).toEqual([]);
  });

  it('counts progress and open flagged items', () => {
    expect(reviewProgress([a, b, c], null)).toEqual({
      blocks: 2,
      approvedBlocks: 0,
      decidedItems: 0,
      openFlagged: 2,
    });
    const review = {
      items: [decided(a), decided(b, 'rejected')],
      blocks: [approved('b01', [a, b])],
    };
    expect(reviewProgress([a, b, c], review)).toEqual({
      blocks: 2,
      approvedBlocks: 1,
      decidedItems: 2,
      openFlagged: 1,
    });
  });

  it('sends confirmed items to bulk approval, derived ones to a closer look, flagged ones to a full read', () => {
    const derived = item('k004', 'b02', 'Dörd', { status: 'derived' });
    const derivedFailed = { ...derived, checks: c.checks };
    expect([a, derived, b, c, derivedFailed].map(reviewTier)).toEqual([
      'auto',
      'targeted',
      'full',
      'full',
      'full',
    ]);
  });

  it('uses an approved correction, and only an approved one', () => {
    const fixed = { statement: 'Düzgün' };
    expect(effectiveContent(a, undefined)).toBe(a.content);
    expect(effectiveContent(a, { decision: 'approved', correction: fixed })).toBe(fixed);
    expect(effectiveContent(a, { decision: 'needs_fix', correction: fixed })).toBe(a.content);
    expect(effectiveContent(a, { decision: 'approved', correction: null })).toBe(a.content);
  });
});
