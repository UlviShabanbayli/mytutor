import { repairNumber } from './repair';
import type { TextItem } from './types';

const TOC_NUMBER = /^(\d+)\.(\d+)\.?$/;

/** The contents page lists topic numbers ("1.1.", "1.2.") in a clean font. */
export function readToc(items: TextItem[]): {
  page: number | null;
  counts: Record<string, number>;
} {
  const byPage = new Map<number, string[]>();
  for (const i of items) {
    const m = TOC_NUMBER.exec(i.text.trim());
    if (m?.[1]) byPage.set(i.page, [...(byPage.get(i.page) ?? []), m[1]]);
  }
  const [page, units] = [...byPage].sort((a, b) => b[1].length - a[1].length)[0] ?? [null, []];
  if (page === null || units.length < 4) return { page: null, counts: {} };
  const counts: Record<string, number> = {};
  for (const u of units) counts[u] = (counts[u] ?? 0) + 1;
  return { page, counts };
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
    const text = repairNumber(i.text).trim();
    if (!/^\d{1,3}$/.test(text)) continue;
    const offset = i.page - Number(text);
    if (offset < 0 || offset > 20) continue;
    offsets.set(offset, (offsets.get(offset) ?? 0) + 1);
  }
  const best = [...offsets].sort((a, b) => b[1] - a[1])[0];
  if (!best || best[1] < 5) return { offset: null, lastNumberedPage };
  for (const i of items) {
    const text = repairNumber(i.text).trim();
    if ((i.y <= margin || i.y >= pageHeight - margin) && Number(text) === i.page - best[0]) {
      lastNumberedPage = Math.max(lastNumberedPage ?? 0, i.page);
    }
  }
  return { offset: best[0], lastNumberedPage };
}
