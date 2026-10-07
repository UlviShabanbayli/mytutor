import type { TextbookBlockKind } from '@mytutor/types';
import type { TextItem, TextLine } from './types';

export type HeadingEvent =
  | { type: 'unit'; page: number; y: number; title: string }
  | { type: 'topic'; page: number; y: number; title: string }
  | { type: 'block'; page: number; y: number; kind: TextbookBlockKind; title: string }
  | { type: 'section'; page: number; y: number; title: string };

/** Heading sizes relative to body text, calibrated on the TRİMS layout (body 12pt). */
const UNIT = 2.4; // 32pt unit (bölmə) titles; STEAM banners are 30pt
const TITLE = 1.6; // 22pt topic titles, 25pt back-matter titles
const SUB = 1.2; // 16pt sub-headings
const MAX = 4; // larger is cover art
/** Sub-headings repeated this often are pedagogical labels ("Yadda saxla!", "Çalışma"). */
const LABEL_REPEATS = 4;

const upper = (s: string) => s.toLocaleUpperCase('az').replace(/["«»]/g, '').trim();

export function blockKind(title: string): TextbookBlockKind | null {
  const t = upper(title);
  if (t.startsWith('STEAM')) return 'steam';
  if (t === 'İLKİN YOXLAMA') return 'pretest';
  if (t.includes('MƏSƏLƏ VƏ MİSALLAR')) return 'problems';
  if (t === 'XÜLASƏ') return 'summary';
  if (t.includes('ÜMUMİLƏŞDİRİCİ TAPŞIRIQLAR')) return 'review';
  if (t === 'SÖZLÜK') return 'glossary';
  if (t === 'CAVABLAR') return 'answers';
  return null;
}

/** Most common font size, weighted by text length. */
export function bodySize(items: TextItem[]): number {
  const weight = new Map<number, number>();
  for (const i of items) {
    const s = Math.round(i.size);
    weight.set(s, (weight.get(s) ?? 0) + i.text.length);
  }
  return [...weight].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 12;
}

const isCaps = (s: string) => s === s.toLocaleUpperCase('az') && /\p{Lu}/u.test(s);
const isQuoted = (s: string) => /^["«].+["»]$/.test(s.trim());
/** Real headings contain a word; large math letters ("a", "b") and figure labels do not. */
const hasWord = (s: string) => /\p{L}{3,}/u.test(s);
const labelKey = (s: string) =>
  s
    .toLocaleLowerCase('az')
    .replace(/[\d.!:]/g, '')
    .trim();

/**
 * Turns heading lines into structural events in reading order.
 * `labels` are the numeric badges drawn beside numbered topic titles.
 */
export function classifyHeadings(
  lines: TextLine[],
  labels: TextItem[],
  body: number,
  pages: { from: number; to: number; height: number },
): HeadingEvent[] {
  const headings = lines
    .filter((l) => l.page >= pages.from && l.page <= pages.to)
    .filter((l) => l.size >= body * SUB && l.size <= body * MAX && hasWord(l.text))
    .sort((a, b) => a.page - b.page || b.y - a.y);

  // A STEAM page names its project in a quoted caps line, above or below the banner.
  const steamTitles = new Map<number, { title: string; y: number }>();
  for (const h of headings) {
    if (h.size < body * TITLE && isCaps(h.text) && isQuoted(h.text)) {
      steamTitles.set(h.page, { title: h.text.replace(/["«»]/g, '').trim(), y: h.y });
    }
  }

  const repeats = new Map<string, number>();
  for (const h of headings) repeats.set(labelKey(h.text), (repeats.get(labelKey(h.text)) ?? 0) + 1);

  const events: HeadingEvent[] = [];
  for (let i = 0; i < headings.length; i++) {
    const line = headings[i];
    if (!line) continue;
    // Multi-line titles: following lines of the same size directly below.
    let title = line.text;
    while (true) {
      const next = headings[i + 1];
      const prevY = headings[i]?.y ?? line.y;
      const continues =
        next &&
        next.page === line.page &&
        Math.abs(next.size - line.size) <= line.size * 0.1 &&
        prevY - next.y <= line.size * 1.7 &&
        !(line.size >= body * UNIT && upper(next.text).startsWith('STEAM'));
      if (!continues) break;
      title = `${title} ${next.text}`;
      i++;
    }
    title = title.replace(/\s+/g, ' ').trim();
    const ratio = line.size / body;
    const kind = blockKind(title);
    const at = { page: line.page, y: line.y };

    if (ratio >= UNIT) {
      if (kind === 'steam') {
        const named = steamTitles.get(line.page);
        // The page starts at whichever is higher: the banner or its title.
        const y = Math.max(line.y, named?.y ?? 0);
        events.push({
          type: 'block',
          kind,
          title: named ? `STEAM: ${named.title}` : 'STEAM',
          page: line.page,
          y,
        });
      } else {
        // Unit openers are full pages: the unit starts at the top even if the title sits lower.
        events.push({ type: 'unit', title, page: line.page, y: pages.height });
      }
    } else if (ratio >= TITLE) {
      const numbered = labels.some(
        (l) => l.page === line.page && Math.abs(l.y - line.y) <= line.size * 0.8 && l.x < line.x,
      );
      if (numbered) events.push({ type: 'topic', title, ...at });
      else events.push({ type: 'block', kind: kind ?? 'other', title, ...at });
    } else if (kind) {
      events.push({ type: 'block', kind, title, ...at });
    } else if (steamTitles.get(line.page)?.y === line.y) {
      continue; // already used as the STEAM project name
    } else if ((repeats.get(labelKey(line.text)) ?? 0) < LABEL_REPEATS) {
      events.push({ type: 'section', title, ...at });
    }
  }
  return events;
}
