import { describe, expect, it } from 'vitest';
import type { BBox } from '@mytutor/types';
import { ownerOf, trimRegions, type RegionedBlock } from './assign';
import { buildBlocks, type DraftBlock } from './blocks';
import { findFigures } from './figures';
import type { PageGraphics } from './graphics';
import { groupSourceLines } from './lines';
import type { Marker } from './markers';
import { findGraphicMarkers, findNumberCircles } from './template';
import type { TextItem } from './types';

const box = (x: number, y: number, width: number, height: number): BBox => ({
  x,
  y,
  width,
  height,
});
const marker = (
  kind: Marker['kind'],
  page: number,
  top: number,
  number: string | null = null,
): Marker => ({
  kind,
  page,
  top,
  label: null,
  title: null,
  number,
});

describe('template markers', () => {
  const graphics: PageGraphics = {
    page: 88,
    images: [],
    paths: [
      { bbox: box(74, 255, 88, 13), fill: '#ff636f', filled: true }, // Məsələ həlli badge
      { bbox: box(71, 223, 18, 19), fill: '#ff5861', filled: true }, // exercise number circle
      { bbox: box(74, 300, 88, 13), fill: '#123456', filled: true }, // unknown colour: ignored
    ],
  };

  it('recognises template badges by colour and size', () => {
    expect(findGraphicMarkers(graphics).map((m) => [m.kind, m.label])).toEqual([
      ['problems', 'Məsələ həlli'],
    ]);
  });

  it('recognises icons by their image sizes', () => {
    const icon: PageGraphics = {
      page: 87,
      paths: [],
      images: ['26x37', '24x7', '26x36', '26x37', '17x29'].map((px) => {
        const [w, h] = px.split('x').map(Number);
        return { bbox: box(64, 362, 22, 32), pixels: { width: w ?? 0, height: h ?? 0 } };
      }),
    };
    expect(findGraphicMarkers(icon).map((m) => m.label)).toEqual(['Yadda saxla!']);
  });

  it('finds number circles in the left gutter', () => {
    expect(findNumberCircles(graphics)).toHaveLength(1);
  });
});

describe('buildBlocks', () => {
  it('nests exercises and examples, and resumes Çalışma after an interrupting box', () => {
    const blocks = buildBlocks(
      [
        marker('title', 1, 70),
        marker('exercises', 2, 70),
        marker('exercise', 2, 100, '1'),
        marker('example', 2, 120),
        marker('exercise', 2, 300, '2'),
        marker('remember', 3, 400),
        marker('exercise', 4, 70, '3'),
      ],
      { page: 1, top: 60 },
      { page: 4, top: 700 },
    );
    const show = (b: DraftBlock) =>
      `${b.kind}${b.number ?? ''}<${b.parent ? `${b.parent.kind}${b.parent.number ?? ''}` : '-'}`;
    expect(blocks.map(show)).toEqual([
      'title<-',
      'exercises<-',
      'exercise1<exercises',
      'example<exercise1',
      'exercise2<exercises',
      'remember<-',
      'exercise3<exercises',
    ]);
    const exercises = blocks[1];
    expect(exercises?.spans.map((s) => [s.from.page, s.to.page])).toEqual([
      [2, 3],
      [4, 4],
    ]);
  });
});

describe('ownership and trimming', () => {
  const region = (page: number, y: number, h: number) => ({
    page,
    printedPage: null,
    bbox: box(50, y, 500, h),
  });
  const exercise1: DraftBlock = {
    kind: 'exercise',
    label: null,
    title: null,
    number: '1',
    parent: null,
    spans: [],
  };
  const example: DraftBlock = {
    kind: 'example',
    label: null,
    title: null,
    number: null,
    parent: exercise1,
    spans: [],
  };
  const exercise2: DraftBlock = {
    kind: 'exercise',
    label: null,
    title: null,
    number: '2',
    parent: null,
    spans: [],
  };
  const blocks: RegionedBlock[] = [
    { d: exercise1, regions: [region(1, 100, 155)] },
    { d: example, regions: [region(1, 120, 135)] }, // padded: reaches into exercise 2
    { d: exercise2, regions: [region(1, 250, 100)] },
  ];

  it('gives an element to the block that opened most recently above it', () => {
    expect(ownerOf(blocks, { page: 1, bbox: box(80, 251, 300, 14) })?.d).toBe(exercise2);
    expect(ownerOf(blocks, { page: 1, bbox: box(80, 130, 300, 14) })?.d).toBe(example);
    expect(ownerOf(blocks, { page: 1, bbox: box(80, 105, 300, 14) })?.d).toBe(exercise1);
  });

  it('trims regions to their content and drops empty pages', () => {
    const block: RegionedBlock = {
      d: exercise1,
      regions: [region(1, 100, 600), region(2, 40, 700)],
    };
    const trimmed = trimRegions(block, [{ page: 1, bbox: box(80, 110, 300, 20) }]);
    expect(trimmed).toHaveLength(1);
    expect(trimmed[0]?.bbox.y).toBe(98);
    expect(trimmed[0]?.bbox.height).toBe(34);
  });
});

describe('findFigures', () => {
  const path = (x: number, y: number, w: number, h: number) => ({
    bbox: box(x, y, w, h),
    fill: '#d4f3fd',
    filled: true,
  });
  const page = { width: 638, height: 808 };

  it('joins shapes laid out in a row and ignores text-covered clusters', () => {
    const g: PageGraphics = {
      page: 85,
      images: [],
      paths: [
        path(370, 151, 46, 46),
        path(370, 151, 46, 46),
        path(419, 169, 14, 9), // square + arrow
        path(454, 151, 46, 46),
        path(454, 151, 46, 46),
        path(503, 169, 14, 9), // 21pt further right
        path(100, 400, 60, 30),
        path(162, 400, 60, 30),
        path(224, 400, 60, 30), // answer cells
      ],
    };
    const text = [box(100, 405, 180, 20)];
    const figures = findFigures(g, { top: 60, bottom: 750 }, page, [], text);
    expect(figures.map((f) => [f.kind, Math.round(f.bbox.x), Math.round(f.bbox.width)])).toEqual([
      ['vector', 370, 147],
    ]);
  });
});

describe('groupSourceLines', () => {
  const item = (text: string, x: number, y: number, size: number, width: number): TextItem => ({
    page: 1,
    text,
    x,
    y,
    size,
    width,
    isLabel: false,
  });

  it('attaches superscripts to their line', () => {
    const lines = groupSourceLines(
      [
        item('(a + b)', 100, 500, 12, 40),
        item('2', 141, 505, 7, 4),
        item('= a', 148, 500, 12, 18),
        item('2', 167, 505, 7, 4),
      ],
      (t) => t,
      12,
    );
    expect(lines.map((l) => l.text)).toEqual(['(a + b)^2 = a^2']);
  });
});
