import { describe, expect, it } from 'vitest';
import type { KnowledgeItem } from '@mytutor/types';
import { filterItems, toExtracted } from './items';

const item = (over: Partial<KnowledgeItem>): KnowledgeItem => ({
  id: 'k001',
  type: 'formula',
  status: 'textbook',
  claimedOrigin: 'textbook',
  readFrom: 'image',
  sources: [
    {
      blockId: 'b03',
      lineIds: ['l020'],
      figureId: null,
      regions: [{ page: 85, printedPage: 83, bbox: { x: 0, y: 0, width: 1, height: 1 } }],
      crops: ['crops/b03-1.png'],
    },
  ],
  content: { name: null, latex: '(a+b)^2=a^2+2ab+b^2', spoken: 'a üstəgəl b-nin kvadratı' },
  checks: [{ name: 'identity', result: 'pass', detail: null }],
  ...over,
});

describe('toExtracted', () => {
  it('rebuilds a typed item from stored content', () => {
    const extracted = toExtracted(item({}));
    expect(extracted?.type).toBe('formula');
    expect(extracted?.type === 'formula' && extracted.latex).toBe('(a+b)^2=a^2+2ab+b^2');
    expect(extracted?.sources).toEqual([{ blockId: 'b03', lineIds: ['l020'], figureId: null }]);
  });

  it('returns null when content does not match the type', () => {
    expect(toExtracted(item({ content: { statement: 'x' } }))).toBeNull();
  });
});

describe('filterItems', () => {
  const items = [
    item({ id: 'k1' }),
    item({
      id: 'k2',
      status: 'unverified',
      checks: [{ name: 'identity', result: 'fail', detail: 'x' }],
    }),
    item({ id: 'k3', type: 'term', status: 'derived' }),
  ];
  it('filters by status, type and failed checks', () => {
    const ids = (f: Parameters<typeof filterItems>[1]) => filterItems(items, f).map((i) => i.id);
    expect(ids({ status: null, type: null, failedOnly: false })).toEqual(['k1', 'k2', 'k3']);
    expect(ids({ status: 'unverified', type: null, failedOnly: false })).toEqual(['k2']);
    expect(ids({ status: null, type: 'term', failedOnly: false })).toEqual(['k3']);
    expect(ids({ status: null, type: null, failedOnly: true })).toEqual(['k2']);
  });
});
