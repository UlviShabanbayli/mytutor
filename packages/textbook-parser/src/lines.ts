import type { TextItem, TextLine } from './types';

type Part = TextItem & { script?: 'sup' | 'sub' };
type Draft = { page: number; size: number; y: number; parts: Part[] };

const SAME_LINE_DY = 0.35; // share of font size two runs on one baseline may differ by
const SCRIPT_DY = 0.65; // superscripts/subscripts sit this far from their line's baseline
const SCRIPT_SIZE = 0.8; // runs smaller than this share of body size are scripts

/** Shadow effects print the same run several times at (almost) the same spot. */
function dedupe(items: TextItem[]): TextItem[] {
  const seen = new Set<string>();
  return items.filter((i) => {
    const key = `${i.page}|${Math.round(i.x)}|${Math.round(i.y)}|${i.text}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function draftLines(items: TextItem[]): Draft[] {
  const sorted = [...items].sort((a, b) => a.page - b.page || b.y - a.y || a.x - b.x);
  const lines: Draft[] = [];
  const byPage = new Map<number, Draft[]>();
  for (const item of sorted) {
    const pageLines = byPage.get(item.page) ?? [];
    byPage.set(item.page, pageLines);
    const line = pageLines.find(
      (l) =>
        Math.abs(l.y - item.y) <= item.size * SAME_LINE_DY &&
        Math.abs(l.size - item.size) <= Math.max(l.size, item.size) * 0.15,
    );
    if (line) line.parts.push(item);
    else {
      const draft = { page: item.page, size: item.size, y: item.y, parts: [item] };
      lines.push(draft);
      pageLines.push(draft);
    }
  }
  return lines;
}

function finish(drafts: Draft[], repair: (text: string) => string): TextLine[] {
  // A wide horizontal gap means a separate column or a figure label, not the same line.
  const segments = drafts.flatMap((l) => {
    const parts = [...l.parts].sort((a, b) => a.x - b.x);
    const out: Part[][] = [];
    for (const p of parts) {
      const current = out.at(-1);
      const last = current?.at(-1);
      if (current && last && p.x - (last.x + last.width) <= l.size * 2) current.push(p);
      else out.push([p]);
    }
    return out.map((group) => ({ ...l, parts: group }));
  });

  return segments.map((l) => {
    let text = '';
    let end = -Infinity;
    for (const p of l.parts) {
      let piece = repair(p.text);
      if (p.script) piece = `${p.script === 'sup' ? '^' : '_'}${piece.trim()}`;
      const gap = p.x - end;
      // Separate runs that are visibly apart; glue split glyphs (e.g. "Ç" + "oxhədlilər").
      if (text && !p.script && gap > p.size * 0.2 && !text.endsWith(' ') && !piece.startsWith(' '))
        text += ' ';
      text += piece;
      end = p.x + p.width;
    }
    const main = l.parts.filter((p) => !p.script);
    const all = main.length ? main : l.parts;
    return {
      page: l.page,
      text: text.replace(/\s+/g, ' ').trim(),
      size: Math.max(...all.map((p) => p.size)),
      minSize: Math.min(...l.parts.map((p) => p.size)),
      x: Math.min(...l.parts.map((p) => p.x)),
      y: l.y,
      width: Math.max(...l.parts.map((p) => p.x + p.width)) - Math.min(...l.parts.map((p) => p.x)),
    };
  });
}

/** Groups non-label items into lines: same page, similar size, same baseline. */
export function groupLines(
  items: TextItem[],
  repair: (text: string) => string,
  { keepLabels = false }: { keepLabels?: boolean } = {},
): TextLine[] {
  return finish(draftLines(dedupe(items.filter((i) => keepLabels || !i.isLabel))), repair);
}

/**
 * Lines for the source layer: keeps every run, and attaches superscripts/subscripts to the
 * line they belong to, marked `^`/`_` ("(a + b)^2"), instead of splitting them off.
 */
export function groupSourceLines(
  items: TextItem[],
  repair: (text: string) => string,
  body: number,
): TextLine[] {
  const unique = dedupe(items);
  const drafts = draftLines(unique.filter((i) => i.size >= body * SCRIPT_SIZE));
  for (const s of unique.filter((i) => i.size < body * SCRIPT_SIZE)) {
    const host = drafts.find((d) => {
      if (d.page !== s.page || Math.abs(s.y - d.y) > d.size * SCRIPT_DY) return false;
      const left = Math.min(...d.parts.map((p) => p.x)) - d.size;
      const right = Math.max(...d.parts.map((p) => p.x + p.width)) + d.size;
      return s.x >= left && s.x <= right;
    });
    if (host) host.parts.push({ ...s, script: s.y > host.y ? 'sup' : 'sub' });
    else drafts.push({ page: s.page, size: s.size, y: s.y, parts: [s] });
  }
  return finish(drafts, repair);
}
