import { describe, expect, it } from 'vitest';
import { splitExtracted } from './index';
import type { ExtractedPdf, TextItem } from './types';

const item = (
  page: number,
  text: string,
  x: number,
  y: number,
  size: number,
  width?: number,
): TextItem => ({
  page,
  text,
  x,
  y,
  size,
  width: width ?? text.length * size * 0.5,
  isLabel: false,
  decoded: true,
});

const BODY = 'Bu mətn dərsliyin adi mətnidir və şrift ölçüsünü müəyyən edir.';

/**
 * A book with no TRİMS markers: unnumbered topics in its contents (page 2), unit openers set
 * large, topic headings slightly larger than body text, page numbers at the foot of each page.
 */
function book(): ExtractedPdf {
  const items: TextItem[] = [];
  const contents: [string, number][] = [
    ['Natural ədədlər ............3', 579],
    ['Ədədlərin müqayisəsi ......5', 567],
    ['Ümumiləşdirici tapşırıqlar ......7', 555],
  ];
  items.push(item(2, 'Mündəricat', 187, 633, 16));
  items.push(item(2, 'Ədədlər', 65, 603, 12), item(2, '1', 37, 601, 18));
  for (const [text, y] of contents) items.push(item(2, text, 33, y, 10, 183));
  items.push(item(2, 'Kəsrlər', 65, 520, 12), item(2, '2', 37, 518, 18));
  const second: [string, number][] = [
    ['Adi kəsrlər ............9', 496],
    ['Kəsrlərin toplanması ......11', 484],
    ['Onluq kəsrlər ......13', 472],
    ['Ümumiləşdirici tapşırıqlar ......15', 460],
  ];
  for (const [text, y] of second) items.push(item(2, text, 33, y, 10, 183));

  const headings: Record<number, [string, number]> = {
    4: ['Ədədlər', 17],
    5: ['Natural ədədlər', 14],
    7: ['Ədədlərin müqayisəsi', 14],
    9: ['Ümumiləşdirici tapşırıqlar', 14],
    10: ['Kəsrlər', 17],
    11: ['Adi kəsrlər', 14],
    13: ['Kəsrlərin toplanması', 14],
    15: ['Onluq kəsrlər', 14],
    17: ['Ümumiləşdirici tapşırıqlar', 14],
  };
  for (let page = 3; page <= 18; page++) {
    const heading = headings[page];
    if (heading) items.push(item(page, heading[0], 78, 644, heading[1]));
    for (let row = 0; row < 12; row++) items.push(item(page, BODY, 50, 600 - row * 14, 11));
    items.push(item(page, String(page - 2), 290, 30, 10)); // printed page number
  }
  return { file: '/books/kitab.pdf', pageCount: 18, pageHeight: 700, items };
}

describe('splitExtracted', () => {
  it('splits a book the heading classifier does not know by its contents', () => {
    const structure = splitExtracted(book());
    expect(structure.validation.method).toBe('contents');
    expect(structure.source.printedPageOffset).toBe(2);
    expect(
      structure.units.map((u) => [
        u.index,
        u.title,
        u.items.map((i) => (i.type === 'topic' ? `${i.number} ${i.title}` : i.kind)),
      ]),
    ).toEqual([
      [1, 'Ədədlər', ['1.1 Natural ədədlər', '1.2 Ədədlərin müqayisəsi', 'review']],
      [
        2,
        'Kəsrlər',
        ['2.1 Adi kəsrlər', '2.2 Kəsrlərin toplanması', '2.3 Onluq kəsrlər', 'review'],
      ],
    ]);
    expect(structure.validation.warnings).toEqual([]);
  });
});
