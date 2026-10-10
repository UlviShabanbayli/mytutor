import { numberText, repairBody } from './repair';
import type { TextItem } from './types';

const TOC_NUMBER = /^(\d+)\.(\d+)\.?$/;
const PAGE_NUMBER = /^\d{1,3}$/;
/** Items whose baselines differ by less than this share of their size sit on one row. */
const SAME_ROW = 0.4;
/** A topic number sits just left of its title; a page number well to the right of it. */
const NUMBER_GAP = 80;
const PAGE_GAP = 100;

/** One line of the table of contents, as printed. */
export type TocEntry = {
  /** Printed topic number ("8.2"), null for blocks such as "İlkin yoxlama" or "Xülasə". */
  number: string | null;
  title: string;
  printedPage: number | null;
  /** PDF page of the contents page this entry is on. */
  tocPage: number;
};

const textOf = (i: TextItem) => (i.decoded ? i.text : repairBody(i.text)).trim();

/** The contents page(s): pages with at least 4 topic numbers ("1.1.", "8.4."). */
function tocPages(items: TextItem[]): number[] {
  const counts = new Map<number, number>();
  for (const i of items)
    if (TOC_NUMBER.test(numberText(i).trim())) counts.set(i.page, (counts.get(i.page) ?? 0) + 1);
  return [...counts]
    .filter(([, n]) => n >= 4)
    .map(([page]) => page)
    .sort((a, b) => a - b);
}

/**
 * Reads the table of contents: each entry's printed topic number, title (titles may wrap over
 * several lines) and printed page. Works on layout only: a number left of a title row starts a
 * topic entry, a number far right of it is the page, and the entry ends on the row that carries
 * its page number. Larger text (unit headings, the page heading) is not an entry.
 */
export function readTocEntries(items: TextItem[]): TocEntry[] {
  const entries: TocEntry[] = [];
  for (const page of tocPages(items)) {
    const onPage = items.filter((i) => i.page === page);
    const numbers = onPage.filter((i) => TOC_NUMBER.test(numberText(i).trim()));
    const pages = onPage.filter((i) => PAGE_NUMBER.test(numberText(i).trim()));
    const isNumber = (i: TextItem) => /^[\d.\s]+$/.test(numberText(i).trim());
    const words = onPage.filter((i) => !isNumber(i) && /\p{L}/u.test(textOf(i)));
    // Entry text is the most common size among titles next to topic numbers.
    const sizes = numbers
      .flatMap((n) =>
        words
          .filter((w) => Math.abs(w.y - n.y) < n.size * SAME_ROW && w.x > n.x)
          .map((w) => w.size),
      )
      .sort((a, b) => a - b);
    const entrySize = sizes[Math.floor(sizes.length / 2)];
    if (entrySize === undefined) continue;
    const rows = words
      .filter((w) => Math.abs(w.size - entrySize) <= entrySize * 0.1)
      .sort((a, b) => a.x - b.x || b.y - a.y);

    // Columns: rows whose left edges line up.
    const columns: TextItem[][] = [];
    for (const row of rows) {
      const column = columns.find((c) => Math.abs((c[0]?.x ?? 0) - row.x) < 15);
      if (column) column.push(row);
      else columns.push([row]);
    }

    const lefts = columns.map((c) => c[0]?.x ?? 0);
    for (const column of columns) {
      column.sort((a, b) => b.y - a.y);
      // A page number belongs to this column only if it sits before the next column starts.
      const left = column[0]?.x ?? 0;
      const limit = Math.min(...lefts.filter((x) => x > left + 15), Infinity);
      let current: TocEntry | null = null;
      for (const row of column) {
        const near = (i: TextItem) => Math.abs(i.y - row.y) < row.size * SAME_ROW;
        const number = numbers.find((n) => near(n) && n.x < row.x && row.x - n.x < NUMBER_GAP);
        const pageItem = pages
          .filter((p) => near(p) && p.x - row.x > PAGE_GAP && p.x < limit)
          .sort((a, b) => a.x - b.x)[0];
        if (!current || number) {
          current = {
            number: number ? numberText(number).trim().replace(/\.$/, '') : null,
            title: textOf(row),
            printedPage: null,
            tocPage: page,
          };
          entries.push(current);
        } else current.title = `${current.title} ${textOf(row)}`;
        if (pageItem) {
          current.printedPage = Number(numberText(pageItem).trim());
          current = null;
        }
      }
    }
  }
  return entries.map((e) => {
    const title = e.title.replace(/\s+/g, ' ').trim();
    // Some layouts set the page number in the same run as the title ("… bucaq 29").
    const trailing = e.printedPage === null ? /^(.*\S)\s+(\d{1,3})$/.exec(title) : null;
    return trailing?.[1]
      ? { ...e, title: trailing[1], printedPage: Number(trailing[2]) }
      : { ...e, title };
  });
}

/** Contents entries, topic counts per unit ({"6": 3, "7": 5}) and the first contents page. */
export function readToc(items: TextItem[]): {
  page: number | null;
  counts: Record<string, number>;
  entries: TocEntry[];
} {
  const entries = readTocEntries(items);
  const counts: Record<string, number> = {};
  for (const e of entries) {
    const unit = e.number?.split('.')[0];
    if (unit) counts[unit] = (counts[unit] ?? 0) + 1;
  }
  const page = entries.length ? Math.min(...entries.map((e) => e.tocPage)) : null;
  return { page: Object.keys(counts).length ? page : null, counts, entries };
}

/** Printed page numbers sit in the top/bottom margin; offset = pdfPage - printed. */
export function readPageNumbers(
  items: TextItem[],
  pageHeight: number,
  body: number,
): { offset: number | null; lastNumberedPage: number | null } {
  const margin = pageHeight * 0.09;
  // Page numbers are set at body size or smaller; cover art digits are huge.
  items = items.filter((i) => i.size <= body * 1.2);
  const offsets = new Map<number, number>();
  let lastNumberedPage: number | null = null;
  for (const i of items) {
    if (i.y > margin && i.y < pageHeight - margin) continue;
    const text = numberText(i).trim();
    if (!/^\d{1,3}$/.test(text)) continue;
    const offset = i.page - Number(text);
    if (offset < 0 || offset > 20) continue;
    offsets.set(offset, (offsets.get(offset) ?? 0) + 1);
  }
  const best = [...offsets].sort((a, b) => b[1] - a[1])[0];
  if (!best || best[1] < 5) return { offset: null, lastNumberedPage };
  for (const i of items) {
    const text = numberText(i).trim();
    if ((i.y <= margin || i.y >= pageHeight - margin) && Number(text) === i.page - best[0]) {
      lastNumberedPage = Math.max(lastNumberedPage ?? 0, i.page);
    }
  }
  return { offset: best[0], lastNumberedPage };
}
