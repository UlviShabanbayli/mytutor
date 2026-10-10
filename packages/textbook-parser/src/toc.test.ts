import { describe, expect, it } from 'vitest';
import type { TextbookTopic, TextbookUnit } from '@mytutor/types';
import { applyToc } from './structure';
import { readTocEntries, type TocEntry } from './toc';
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

  it("ignores the next column's page number beside a wrapped title", () => {
    const wrapped = [
      item('6.1.', 75, 644, 12, false),
      item('Funksiyanın tərifi və', 109, 645),
      item('xassələri', 109, 632),
      item('7', 292, 632, 11, false),
      item('6.2.', 75, 618, 12, false),
      item('Funksiyanın qrafiki', 109, 619),
      item('11', 292, 619, 11, false),
      item('7.1.', 349, 657, 12, false),
      item('Çevrə', 383, 658),
      item('25', 566, 658, 11, false),
      item('7.2.', 349, 644, 12, false),
      item('Mərkəzi bucaq', 383, 645),
      item('29', 566, 645, 11, false),
    ];
    expect(readTocEntries(wrapped).map((e) => [e.number, e.title, e.printedPage])).toEqual([
      ['6.1', 'Funksiyanın tərifi və xassələri', 7],
      ['6.2', 'Funksiyanın qrafiki', 11],
      ['7.1', 'Çevrə', 25],
      ['7.2', 'Mərkəzi bucaq', 29],
    ]);
  });

  it('cuts dot leaders, with the page in its own run or in the title run', () => {
    const leaders = [
      item('1.1.', 75, 644, 12, false),
      item('Funksiya . . . . . .', 109, 645),
      item('7', 400, 645, 11, false),
      item('1.2.', 75, 631, 12, false),
      item('Qrafik', 109, 632),
      item('. . . . 11', 380, 632, 11, false),
      item('1.3.', 75, 618, 12, false),
      item('Tənlik . . . . . . 15', 109, 619),
      item('1.4.', 75, 605, 12, false),
      item('Modul……………… 18', 109, 606),
    ];
    expect(readTocEntries(leaders).map((e) => [e.number, e.title, e.printedPage])).toEqual([
      ['1.1', 'Funksiya', 7],
      ['1.2', 'Qrafik', 11],
      ['1.3', 'Tənlik', 15],
      ['1.4', 'Modul', 18],
    ]);
  });

  it('does not let a title run in another font cut off the page numbers', () => {
    const formula = [
      item('1.1.', 75, 644, 12, false),
      item('Funksiya', 109, 645),
      item('7', 500, 645, 11, false),
      item('1.2.', 75, 631, 12, false),
      item('Xətti funksiya', 109, 632),
      item('y = kx + b', 200, 632), // italic: pdf.js starts a new run
      item('11', 500, 632, 11, false),
      item('1.3.', 75, 618, 12, false),
      item('Modul', 109, 619),
      item('15', 500, 619, 11, false),
      item('1.4.', 75, 605, 12, false),
      item('Tənlik', 109, 606),
      item('19', 500, 606, 11, false),
    ];
    expect(
      readTocEntries(formula)
        .filter((e) => e.number)
        .map((e) => [e.number, e.printedPage]),
    ).toEqual([
      ['1.1', 7],
      ['1.2', 11],
      ['1.3', 15],
      ['1.4', 19],
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
    expect(result.replaced).toEqual(['səh. 9: "ʹun˞siya"', 'səh. 21: "XÜLASƏ"']);
    // Entries that no heading matched are reported, not silently dropped.
    expect(result.warnings).toEqual([
      'Mündəricatdakı 7.1 "Vətərlər, kəsən və toxunanlar arasındakı bucaqlar" (səh. 33) mətndə tapılmadı',
      'Mündəricatdakı 7.2 "Mərkəzi bucaq" (səh. 29) mətndə tapılmadı',
      'Mündəricatdakı 8.1 "Elementar hadisə" (səh. 103) mətndə tapılmadı',
    ]);
  });

  it('keeps readable titles that differ from the contents and fixes spacing or case', () => {
    const units: TextbookUnit[] = [
      {
        index: 1,
        title: 'Funksiya',
        startPage: 8,
        endPage: 20,
        items: [topic('1.1', 'Funksiyalar', 9), topic('1.2', 'Funksiyanın  QRAFİKİ', 13)],
      },
    ];
    const result = applyToc(units, [], readTocEntries(tocPage), 2);
    expect(
      units[0]?.items.map((i) => (i.type === 'topic' ? `${i.number} ${i.title}` : i.title)),
    ).toEqual(['6.1 Funksiyalar', '6.2 Funksiyanın qrafiki']);
    expect(result.replaced).toEqual(['səh. 13: "Funksiyanın  QRAFİKİ"']);
  });

  /** Contents 1.1 Alpha (p. 7), 1.2 Beta (p. 11), 1.3 Gamma (p. 15); offset 2. */
  const listed: TocEntry[] = [
    { number: '1.1', title: 'Alpha', printedPage: 7, tocPage: 3 },
    { number: '1.2', title: 'Beta', printedPage: 11, tocPage: 3 },
    { number: '1.3', title: 'Gamma', printedPage: 15, tocPage: 3 },
  ];
  const unitOf = (items: TextbookTopic[]): TextbookUnit[] => [
    { index: 1, title: 'Bölmə', startPage: 8, endPage: 20, items },
  ];
  const numbered = (units: TextbookUnit[]) =>
    units[0]?.items.map((i) => (i.type === 'topic' ? `${i.number} ${i.title}` : i.title));

  it('matches exact pages first, so an extra heading one page early takes no number', () => {
    const units = unitOf([
      topic('1.1', 'Alpha', 9),
      topic('1.2', 'Spurious', 12), // printed 10, one page before Beta
      topic('1.3', 'Beta', 13),
      topic('1.4', 'Gamma', 17),
    ]);
    const result = applyToc(units, [], listed, 2);
    expect(numbered(units)).toEqual(['1.1 Alpha', '1.4 Spurious', '1.2 Beta', '1.3 Gamma']);
    expect(result.warnings).toEqual(['səh. 12: "Spurious" mövzusu mündəricatda tapılmadı (1.4)']);
  });

  it('gives an unlisted topic a free number and keeps a free place number', () => {
    const units = unitOf([
      topic('1.1', 'Alpha', 9),
      topic('1.2', 'Extra', 11),
      topic('1.3', 'Beta', 13),
    ]);
    applyToc(units, [], listed.slice(0, 2), 2);
    expect(numbered(units)).toEqual(['1.1 Alpha', '1.3 Extra', '1.2 Beta']);

    const other: TextbookUnit[] = [
      {
        index: 2,
        title: 'Əlavə',
        startPage: 58,
        endPage: 62,
        items: [topic('2.1', 'Əlavə mövzu', 60)],
      },
    ];
    expect(applyToc(other, [], readTocEntries(tocPage), 2).warnings[0]).toBe(
      'səh. 60: "Əlavə mövzu" mövzusu mündəricatda tapılmadı (2.1)',
    );
  });

  it('retitles a heading one page off only when it reads the same', () => {
    const units = unitOf([topic('1.1', 'ʹ˞ label', 10), topic('1.2', 'Bet a', 14)]);
    const result = applyToc(units, [], listed.slice(0, 2), 2);
    expect(numbered(units)).toEqual(['1.1 ʹ˞ label', '1.2 Beta']);
    expect(result.replaced).toEqual(['səh. 14: "Bet a"']);
  });
});
