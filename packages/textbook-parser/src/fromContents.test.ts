import { describe, expect, it } from 'vitest';
import type { Contents, ContentsEntry } from './contents';
import { inferOffset, structureFromContents } from './fromContents';
import type { TextLine } from './types';

const line = (page: number, text: string, y: number, size = 11): TextLine => ({
  page,
  text,
  size,
  minSize: size,
  x: 78,
  y,
  width: text.length * size * 0.5,
});
const topic = (title: string, printedPage: number): ContentsEntry => ({
  number: null,
  title,
  printedPage,
  kind: null,
});

// Part 2 of a book: units 6 and 7, printed page = PDF page − 2.
const contents: Contents = {
  pages: [3],
  front: [],
  units: [
    {
      number: 6,
      title: 'Kvadrat kök',
      entries: [
        topic('Kvadrat köklər', 5),
        topic('Həqiqi ədədlər', 7),
        { number: null, title: 'Ümumiləşdirici tapşırıqlar', printedPage: 9, kind: 'review' },
      ],
    },
    {
      number: 7,
      title: 'Pifaqor teoremi',
      entries: [topic('Pifaqor teoremi', 10), topic('Teoremin tətbiqi', 12)],
    },
  ],
  back: [{ number: null, title: 'Cavablar', printedPage: 14, kind: 'answers' }],
};

const lines = [
  line(6, 'Kvadrat kök', 630, 17), // unit opener
  line(6, 'Siz bu bölmədə öyrənəcəksiniz:', 560),
  line(7, 'Kvadrat köklər', 644, 14),
  line(7, 'Məsələ. Kvadratın sahəsi 49-dur.', 620),
  line(9, 'Həqiqi ədədlər', 400, 14), // starts mid-page
  line(11, 'Ümumiləşdirici tapşırıqlar', 644, 14),
  line(12, 'Pifaqor teoremi', 630, 17), // unit opener; the contents give it as the topic's page
  line(13, 'Pifaqor teoremi', 644, 14),
  // No heading for "Teoremin tətbiqi" (printed 12, PDF 14).
  line(14, 'Nümunə 1. Üçbucağın tərəfini tapın.', 600),
  line(16, 'Cavablar', 644, 14),
];

const ranges = (items: { startPage: number; endPage: number }[]) =>
  items.map((i) => [
    'number' in i ? i.number : 'title' in i ? i.title : '',
    i.startPage,
    i.endPage,
  ]);

describe('structureFromContents', () => {
  const built = structureFromContents({
    contents,
    lines,
    body: 11,
    offset: 2,
    pageHeight: 700,
    lastPage: 17,
  });

  it('builds units, topics and blocks in contents order, numbered by unit digits', () => {
    expect(built.units.map((u) => [u.index, u.title, u.startPage, u.endPage])).toEqual([
      [6, 'Kvadrat kök', 6, 11],
      [7, 'Pifaqor teoremi', 12, 15],
    ]);
    expect(built.units.map((u) => ranges(u.items))).toEqual([
      [
        ['6.1', 7, 9],
        ['6.2', 9, 10],
        ['Ümumiləşdirici tapşırıqlar', 11, 11],
      ],
      [
        ['7.1', 13, 13],
        ['7.2', 14, 15],
      ],
    ]);
    expect(built.counts).toEqual({ '6': 2, '7': 2 });
  });

  it('starts a topic where its heading is, skipping the unit opener that reads alike', () => {
    const [first, second] = built.units[0]?.items ?? [];
    expect(first?.startY).toBe(39.2); // the heading's top edge: 700 − 644 − 14 × 1.2
    expect(second?.startY).toBeGreaterThan(250); // the heading in the middle of PDF page 9
    expect(built.units[1]?.items[0]?.startPage).toBe(13);
  });

  it('starts a topic without a heading at its contents page, with a warning', () => {
    expect(built.warnings).toEqual([
      'səh. 14: "Teoremin tətbiqi" başlığı mətndə tapılmadı; mündəricatdakı səhifədən başladı',
    ]);
  });

  it('puts book-level pages after the units in the back matter', () => {
    expect(ranges(built.backMatter)).toEqual([['Cavablar', 16, 17]]);
  });

  it('infers the page offset from where the titles appear', () => {
    expect(inferOffset(contents, lines, 11)).toBe(2);
  });
});
