import type { TextItem, TextLine } from './types';

/** Groups non-label items into lines: same page, similar size, same baseline. */
export function groupLines(items: TextItem[], repair: (text: string) => string): TextLine[] {
  const seen = new Set<string>();
  const sorted = items
    .filter((i) => !i.isLabel)
    // Shadow effects print the same run several times at (almost) the same spot.
    .filter((i) => {
      const key = `${i.page}|${Math.round(i.x)}|${Math.round(i.y)}|${i.text}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => a.page - b.page || b.y - a.y || a.x - b.x);

  type Draft = { page: number; size: number; y: number; parts: TextItem[] };
  const lines: Draft[] = [];
  const byPage = new Map<number, Draft[]>();
  for (const item of sorted) {
    const pageLines = byPage.get(item.page) ?? [];
    byPage.set(item.page, pageLines);
    const line = pageLines.find(
      (l) =>
        Math.abs(l.y - item.y) <= item.size * 0.35 &&
        Math.abs(l.size - item.size) <= Math.max(l.size, item.size) * 0.15,
    );
    if (line) {
      line.parts.push(item);
    } else {
      const draft = { page: item.page, size: item.size, y: item.y, parts: [item] };
      lines.push(draft);
      pageLines.push(draft);
    }
  }

  // A wide horizontal gap means a separate column or a figure label, not the same line.
  const segments = lines.flatMap((l) => {
    const parts = l.parts.sort((a, b) => a.x - b.x);
    const out: TextItem[][] = [];
    for (const p of parts) {
      const current = out.at(-1);
      const last = current?.at(-1);
      if (current && last && p.x - (last.x + last.width) <= p.size * 2) current.push(p);
      else out.push([p]);
    }
    return out.map((group) => ({ ...l, parts: group }));
  });

  return segments.map((l) => {
    const parts = l.parts;
    let text = '';
    let end = -Infinity;
    for (const p of parts) {
      const piece = repair(p.text);
      const gap = p.x - end;
      // Separate runs that are visibly apart; glue split glyphs (e.g. "Ç" + "oxhədlilər").
      if (text && gap > p.size * 0.2 && !text.endsWith(' ') && !piece.startsWith(' ')) text += ' ';
      text += piece;
      end = p.x + p.width;
    }
    return {
      page: l.page,
      text: text.replace(/\s+/g, ' ').trim(),
      size: Math.max(...parts.map((p) => p.size)),
      x: Math.min(...parts.map((p) => p.x)),
      y: l.y,
    };
  });
}
