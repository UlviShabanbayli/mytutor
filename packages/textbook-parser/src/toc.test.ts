import { describe, expect, it } from 'vitest';
import type { TextbookTopic, TextbookUnit } from '@mytutor/types';
import { applyToc } from './structure';
import { readTocEntries } from './toc';
import type { TextItem } from './types';

const item = (text: string, x: number, y: number, size = 11, decoded = true): TextItem => ({
  page: 6,
  text,
  x,
  y,
  size,
  width: text.length * size * 0.5,
  isLabel: false,
  decoded,
});

// A two-column contents page: numbers left of titles, pages far right, one wrapped title.
const tocPage = [
  item('MÜNDƏRİCAT', 106, 731, 16),
  item('\u0019\u0011\u0014\u0011', 75, 644, 12, false), // shifted "6.1."
  item('Funksiya', 109, 645),
  item('7', 292, 645, 11, false),
  item('6.2.', 75, 631, 12, false),
  item('Funksiyanın qrafiki', 109, 632),
  item('11', 292, 632, 11, false),
  item('Xülasə', 109, 619),
  item('19', 292, 619, 11, false),
  item('7.1.', 349, 642, 12, false),
  item('Vətərlər, kəsən və toxunanlar', 383, 643),
  item('arasındakı bucaqlar', 383, 630),
  item('33', 566, 630, 11, false),
  item('7.2.', 349, 616, 12, false),
  item('Mərkəzi bucaq 29', 383, 617),
  item('8.1.', 349, 600, 12, false),
  item('Elementar hadisə', 383, 601),
  item('103', 560, 601, 11, false),
];

describe('readTocEntries', () => {
  it('reads numbers, wrapped titles and pages column by column', () => {
    expect(readTocEntries(tocPage).map((e) => [e.number, e.title, e.printedPage])).toEqual([
      ['6.1', 'Funksiya', 7],
      ['6.2', 'Funksiyanın qrafiki', 11],
      [null, 'Xülasə', 19],
      ['7.1', 'Vətərlər, kəsən və toxunanlar arasındakı bucaqlar', 33],
      ['7.2', 'Mərkəzi bucaq', 29],
      ['8.1', 'Elementar hadisə', 103],
    ]);
  });
});

describe('applyToc', () => {
  const topic = (number: string, title: string, startPage: number): TextbookTopic => ({
    type: 'topic',
    number,
    title,
    startPage,
    endPage: startPage + 2,
    sections: [],
  });

  it('takes printed numbers by page, the unit number, and readable titles', () => {
    const units: TextbookUnit[] = [
      {
        index: 1,
        title: 'Funksiya',
        startPage: 8,
        endPage: 20,
        items: [
          topic('1.1', 'ʹun˞siya', 9),
          topic('1.2', 'Funksiyanın qrafiki', 13),
          { type: 'block', kind: 'summary', title: 'XÜLASƏ', startPage: 21, endPage: 21 },
        ],
      },
    ];
    const entries = readTocEntries(tocPage);
    const result = applyToc(units, [], entries, 2);
    const [unit] = units;
    expect(unit?.index).toBe(6);
    expect(
      unit?.items.map((i) => (i.type === 'topic' ? `${i.number} ${i.title}` : i.title)),
    ).toEqual(['6.1 Funksiya', '6.2 Funksiyanın qrafiki', 'Xülasə']);
    expect(result.replaced).toEqual(['ʹun˞siya', 'XÜLASƏ']);
    // Entries that no heading matched are reported, not silently dropped.
    expect(result.warnings.some((w) => w.includes('7.1'))).toBe(true);
  });
});
