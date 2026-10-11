import { describe, expect, it } from 'vitest';
import type { KnowledgeItem } from '@mytutor/types';
import {
  coverage,
  emptyLinks,
  fingerprint,
  resolveItemLinks,
  withItemCodes,
  withoutItemLink,
  withTopicCodes,
} from './links';

const item = (id: string, statement: string): KnowledgeItem => ({
  id,
  type: 'rule',
  status: 'textbook',
  claimedOrigin: 'textbook',
  readFrom: 'text',
  sources: [{ blockId: 'b1', lineIds: [], figureId: null, regions: [], crops: [] }],
  content: { statement, extra: { b: 1, a: 2 } },
  checks: [],
});

describe('fingerprint', () => {
  it('depends on type and content, not on id, status or key order', () => {
    const a = item('k001', 'Bərabərlik');
    const b = {
      ...item('k009', 'Bərabərlik'),
      status: 'unverified',
      content: { extra: { a: 2, b: 1 }, statement: 'Bərabərlik' },
    } as KnowledgeItem;
    expect(fingerprint(a)).toBe(fingerprint(b));
    expect(fingerprint(a)).not.toBe(fingerprint(item('k001', 'Başqa')));
  });
});

describe('item links', () => {
  const one = item('k001', 'Bir');
  const two = item('k002', 'İki');

  it('finds items by id and content, by content alone, or reports them gone', () => {
    const links = [
      { topic: '1.1', itemId: 'k001', fingerprint: fingerprint(one), codes: ['1.1'] },
      // Renumbered: "İki" was k005 when it was linked.
      { topic: '1.1', itemId: 'k005', fingerprint: fingerprint(two), codes: ['1.2'] },
      { topic: '1.1', itemId: 'k003', fingerprint: 'deadbeef', codes: ['2.1'] },
    ];
    const { byItem, orphans } = resolveItemLinks(links, [one, two]);
    expect([...byItem]).toEqual([
      ['k001', ['1.1']],
      ['k002', ['1.2']],
    ]);
    expect(orphans.map((o) => o.itemId)).toEqual(['k003']);
  });

  it('sets an item, rewrites renumbered links and keeps other topics and orphans', () => {
    let links = emptyLinks('c1');
    links = {
      ...links,
      items: [
        { topic: '1.1', itemId: 'k005', fingerprint: fingerprint(two), codes: ['1.2'] },
        { topic: '1.1', itemId: 'k003', fingerprint: 'deadbeef', codes: ['2.1'] },
        { topic: '1.2', itemId: 'k001', fingerprint: 'x', codes: ['3.1'] },
      ],
    };
    links = withItemCodes(links, '1.1', [one, two], 'k001', ['1.1', '1.3']);
    expect(links.items).toEqual([
      { topic: '1.2', itemId: 'k001', fingerprint: 'x', codes: ['3.1'] },
      { topic: '1.1', itemId: 'k001', fingerprint: fingerprint(one), codes: ['1.1', '1.3'] },
      { topic: '1.1', itemId: 'k002', fingerprint: fingerprint(two), codes: ['1.2'] },
      { topic: '1.1', itemId: 'k003', fingerprint: 'deadbeef', codes: ['2.1'] },
    ]);
    const orphan = links.items[3];
    if (!orphan) throw new Error('missing orphan');
    expect(withoutItemLink(links, orphan).items).toHaveLength(3);
    expect(withItemCodes(links, '1.1', [one, two], 'k001', []).items.map((l) => l.itemId)).toEqual([
      'k001',
      'k002',
      'k003',
    ]);
  });
});

describe('topic links and coverage', () => {
  it('sets and clears a topic and counts coverage from topics and items', () => {
    let links = withTopicCodes(emptyLinks('c1'), '1.1', ['1.1', '1.2']);
    links = withTopicCodes(links, '1.2', ['1.2']);
    links = { ...links, items: [{ topic: '1.3', itemId: 'k1', fingerprint: 'f', codes: ['2.1'] }] };
    const c = coverage(links);
    expect([...c.topicsByCode]).toEqual([
      ['1.1', ['1.1']],
      ['1.2', ['1.1', '1.2']],
      ['2.1', ['1.3']],
    ]);
    expect(c).toMatchObject({ linkedTopics: 3, itemLinks: 1 });
    expect(withTopicCodes(links, '1.1', []).topics).toEqual({ '1.2': ['1.2'] });
  });
});
