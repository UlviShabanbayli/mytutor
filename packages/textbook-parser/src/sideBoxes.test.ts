import { describe, expect, it } from 'vitest';
import type { BBox } from '@mytutor/types';
import { buildBlocks, withSideBoxes } from './blocks';
import type { PageGraphics, PageImage, PagePath } from './graphics';
import { findMarkers } from './markers';
import { findSideBoxes, type SideBox } from './template';
import { buildTopicSource } from './topicSource';
import type { TextItem, TextLine } from './types';

const box = (x: number, y: number, width: number, height: number): BBox => ({
  x,
  y,
  width,
  height,
});
const path = (fill: string, b: BBox): PagePath => ({ bbox: b, fill, filled: true });
const image = (px: string, b: BBox): PageImage => {
  const [width = 0, height = 0] = px.split('x').map(Number);
  return { bbox: b, pixels: { width, height } };
};
const page = { width: 638, height: 808 };

/** The "Açar sözlər" box as drawn at the top right of 6.1 (part 2, page 9). */
const keywordsBox = (pill = '#99ddcc'): PageGraphics => ({
  page: 9,
  images: [
    image('32x27', box(447, 76, 27, 22)),
    image('2x27', box(446, 76, 1.4, 22)),
    image('30x30', box(450, 76, 25, 25)),
  ],
  paths: [
    path('#fbfaf7', box(452, 90, 115, 118)), // panel
    path(pill, box(486, 80, 72, 14)), // label pill
    path('#ffffff', box(486, 80, 72, 14)), // the label's outlined letters
    path(pill, box(444, 72, 31, 30)), // disc behind the key icon
    path('#ffffff', box(443, 71, 33, 32)), // its ring
  ],
});

describe('findSideBoxes', () => {
  it('recognises the key-words box by its panel, pill and icon', () => {
    const boxes = findSideBoxes(keywordsBox(), page.width);
    expect(boxes.map((b) => [b.kind, b.label, b.frame])).toEqual([
      ['keywords', 'Açar sözlər', true],
    ]);
    // The box spans the panel and its label strip, ring included.
    expect(boxes[0]?.bbox).toEqual(box(443, 71, 124, 137));
  });

  it('finds it whatever the unit colour of its pill', () => {
    expect(findSideBoxes(keywordsBox('#95d2d0'), page.width)).toHaveLength(1);
  });

  it('keeps an unknown labelled side box as a callout for review', () => {
    const g = keywordsBox();
    g.images = [image('40x40', box(447, 76, 27, 22))];
    expect(findSideBoxes(g, page.width).map((b) => [b.kind, b.label])).toEqual([['callout', null]]);
  });

  it('ignores drawing backgrounds and full-width boxes', () => {
    const g: PageGraphics = {
      page: 9,
      images: [],
      paths: [
        path('#fff7e8', box(322, 156, 122, 94)), // diagram background: no pill
        path('#e9f2f8', box(64, 400, 500, 60)), // full-width box with a dark pill on its edge
        path('#7e9640', box(90, 392, 60, 16)),
      ],
    };
    expect(findSideBoxes(g, page.width)).toEqual([]);
  });
});

describe('markers in narrow panels', () => {
  const line = (text: string, x: number, top: number, size = 12): TextLine => ({
    page: 65,
    text,
    size,
    minSize: size,
    x,
    y: page.height - top - size,
    width: 60,
  });
  const panels = [{ page: 65, bbox: box(421, 198, 146, 66) }];
  const markers = (lines: TextLine[]) =>
    findMarkers({ lines, items: [], graphics: [], body: 12, pageHeight: page.height, panels });

  it('makes a panel with a printed label a side box of that kind', () => {
    expect(markers([line('NÜMUNƏ', 457, 201)])).toEqual([
      {
        kind: 'example',
        page: 65,
        top: 201,
        label: 'NÜMUNƏ',
        title: null,
        number: null,
        box: box(421, 198, 146, 66),
      },
    ]);
  });

  it('never opens a heading from big glyphs inside a panel', () => {
    expect(markers([line('...', 480, 220, 18)])).toEqual([]);
    expect(markers([line('Funksiya', 137, 332, 18)]).map((m) => m.kind)).toEqual(['section']);
  });
});

describe('withSideBoxes', () => {
  const side = (kind: SideBox['kind'], top: number, label: string | null = null): SideBox => ({
    kind,
    label,
    number: null,
    page: 9,
    bbox: box(440, top, 120, 60),
    parts: [box(440, top, 120, 60)],
    frame: kind === 'keywords',
  });
  const marker = (kind: SideBox['kind'], top: number) => ({
    kind,
    page: 9,
    top,
    label: null,
    title: null,
    number: null,
  });

  it('places a box after the block open at its top, never before the heading', () => {
    const blocks = buildBlocks(
      [marker('title', 72), marker('inquiry', 118), marker('section', 330)],
      { page: 9, top: 68 },
      { page: 9, top: 740 },
    );
    const placed = withSideBoxes(blocks, [side('keywords', 71), side('example', 198, 'NÜMUNƏ')]);
    expect(placed.map((b) => `${b.kind}<${b.parent?.kind ?? '-'}`)).toEqual([
      'title<-',
      'keywords<-',
      'inquiry<-',
      'example<inquiry',
      'section<-',
    ]);
  });
});

describe('buildTopicSource with a key-words box', () => {
  const item = (text: string, x: number, top: number, width: number, size = 12): TextItem => ({
    page: 9,
    text,
    size,
    x,
    y: page.height - top - size,
    width,
    isLabel: false,
    decoded: true,
  });
  const source = buildTopicSource({
    topic: {
      type: 'topic',
      number: '6.1',
      title: 'Funksiya',
      sections: [],
      startPage: 9,
      endPage: 9,
      startY: 72,
    },
    unit: { index: 6, title: 'Funksiya' },
    items: [
      item('Funksiya', 113, 72, 120, 28),
      item('• uyğunluq diaqramı', 455, 100, 108),
      item('Araşdırma-müzakirə', 60, 120, 150, 16),
      // One baseline, two columns: the inquiry text and a bullet of the box 20pt to its right.
      item('Anar evdən 100 m məsafədə olan mağazaya getdi.', 57, 144, 375),
      item('• arqument', 452, 144, 60),
      item('Diaqramdakı ədədlər arasında uyğunluğu izah edin.', 57, 250, 300),
    ],
    graphics: [keywordsBox()],
    page,
    body: 12,
    printedPageOffset: 2,
  });
  const linesOf = (kind: string) => {
    const block = source.blocks.find((b) => b.kind === kind);
    return source.lines.filter((l) => block?.lineIds.includes(l.id)).map((l) => l.text);
  };

  it('gives the box its own block, after the title', () => {
    expect(source.blocks.map((b) => b.kind)).toEqual(['title', 'keywords', 'inquiry']);
    expect(source.blocks[1]?.label).toBe('Açar sözlər');
    expect(source.blocks[1]?.regions.map((r) => r.bbox)).toEqual([box(443, 71, 124, 137)]);
  });

  it('owns the lines inside the box, split from text on the same baseline', () => {
    expect(linesOf('keywords')).toEqual(['• uyğunluq diaqramı', '• arqument']);
    expect(linesOf('title')).toEqual(['Funksiya']);
    expect(linesOf('inquiry')).toEqual([
      'Araşdırma-müzakirə',
      'Anar evdən 100 m məsafədə olan mağazaya getdi.',
      'Diaqramdakı ədədlər arasında uyğunluğu izah edin.',
    ]);
  });

  it('does not take the box frame for a figure', () => {
    expect(source.figures).toEqual([]);
  });
});
