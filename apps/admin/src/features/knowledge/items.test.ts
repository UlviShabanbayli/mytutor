import { describe, expect, it } from 'vitest';
import type { KnowledgeItem, SourceFigure, TopicSource } from '@mytutor/types';
import { figureWidth, figuresOf, filterItems, toExtracted } from './items';

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

describe('figuresOf', () => {
  const figure = (id: string): SourceFigure => ({
    id,
    kind: 'vector',
    region: { page: 85, printedPage: 83, bbox: { x: 0, y: 0, width: 1, height: 1 } },
    labels: [],
    image: `figures/${id}.png`,
  });
  // Only the figures matter here.
  const source = { figures: [figure('f01'), figure('f02')] } as TopicSource;
  const ref = (figureId: string | null) => ({
    blockId: 'b03',
    lineIds: [],
    figureId,
    regions: [{ page: 85, printedPage: 83, bbox: { x: 0, y: 0, width: 1, height: 1 } }],
    crops: [],
  });

  it('lists the cited figures once, in citation order, skipping unknown ids', () => {
    const cited = item({ sources: [ref('f02'), ref(null), ref('f01'), ref('f02'), ref('f99')] });
    expect(figuresOf(cited, source).map((f) => f.id)).toEqual(['f02', 'f01']);
    expect(figuresOf(item({}), source)).toEqual([]);
  });
});

describe('figureWidth', () => {
  it('shows a figure at its printed size, narrower when it would be taller than the cap', () => {
    // 525pt x 64pt number line: 700px wide (the card then caps it), 85px tall.
    expect(figureWidth({ x: 0, y: 0, width: 525, height: 64 })).toBe(700);
    // 156pt x 135pt picture: printed 180px tall would fit, so 208px wide.
    expect(figureWidth({ x: 0, y: 0, width: 156, height: 135 })).toBe(208);
    // 100pt x 300pt: printed 400px tall, narrowed to 64px wide for 192px.
    expect(figureWidth({ x: 0, y: 0, width: 100, height: 300 })).toBe(64);
    expect(figureWidth({ x: 0, y: 0, width: 30, height: 0 })).toBe(40);
  });
});
