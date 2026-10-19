import type { TextbookStructure } from '@mytutor/types';
import { hasWord, type HeadingEvent } from './classify';
import type { Contents, ContentsEntry } from './contents';
import { isSuspicious } from './repair';
import { buildStructure, similarity } from './structure';
import { heightOf, type PageHeight, type TextLine } from './types';

/** Headings are set larger than body text; unit openers larger still. */
const HEADING = 1.05;
const UNIT_HEADING = 1.3;
/** Title similarity a heading needs to be taken as an entry's or a unit's. */
const MATCH = 0.6;
const UNIT_MATCH = 0.5;
/** A heading one page off the contents' page scores this much lower. */
const PAGE_OFF = 0.1;
/** A unit opener comes at most this many pages before its first entry. */
const OPENER_PAGES = 3;
const MAX_OFFSET = 20;
const TOPIC_NUMBER = /^\d+\.\d+$/;

/** A heading line, alone or joined with the same-size lines right below it. */
type Candidate = { page: number; y: number; size: number; text: string; ys: number[] };
type Position = { page: number; y: number; top: number };

function candidates(lines: TextLine[], body: number): Map<number, Candidate[]> {
  const headings = lines
    .filter((l) => l.size >= body * HEADING && hasWord(l.text))
    .sort((a, b) => a.page - b.page || b.y - a.y);
  const byPage = new Map<number, Candidate[]>();
  headings.forEach((line, i) => {
    const list = byPage.get(line.page) ?? [];
    byPage.set(line.page, list);
    let joined: Candidate = { ...line, ys: [line.y] };
    list.push(joined);
    for (const next of headings.slice(i + 1, i + 3)) {
      const below = (joined.ys.at(-1) ?? line.y) - next.y;
      if (next.page !== line.page || Math.abs(next.size - line.size) > line.size * 0.1) break;
      if (below > line.size * 1.8) break;
      joined = { ...joined, text: `${joined.text} ${next.text}`, ys: [...joined.ys, next.y] };
      list.push(joined);
    }
  });
  return byPage;
}

/** The heading that best reads like `title` on `pages` (nearest first), or null. */
function locate(
  title: string,
  pages: number[],
  byPage: Map<number, Candidate[]>,
  opts: { minSize: number; match: number; skip?: (c: Candidate) => boolean },
): Candidate | null {
  let best: { c: Candidate; score: number } | null = null;
  pages.forEach((page, distance) => {
    for (const c of byPage.get(page) ?? []) {
      if (c.size < opts.minSize || opts.skip?.(c)) continue;
      const score = similarity(title, c.text) - distance * PAGE_OFF;
      if (score >= opts.match && (!best || score > best.score)) best = { c, score };
    }
  });
  return (best as { c: Candidate } | null)?.c ?? null;
}

/** pdfPage − printedPage, from where the contents' titles appear as headings. */
export function inferOffset(contents: Contents, lines: TextLine[], body: number): number | null {
  const byPage = candidates(lines, body);
  const entries = contents.units.flatMap((u) => u.entries).filter((e) => e.kind === null);
  let best: { offset: number; hits: number } | null = null;
  for (let offset = 0; offset <= MAX_OFFSET; offset++) {
    const hits = entries.filter((e) =>
      locate(e.title, [e.printedPage + offset], byPage, { minSize: 0, match: MATCH }),
    ).length;
    if (hits >= 3 && (!best || hits > best.hits)) best = { offset, hits };
  }
  return best?.offset ?? null;
}

type Input = {
  contents: Contents;
  /** Heading lines of the book (contents pages are skipped). */
  lines: TextLine[];
  body: number;
  /** pdfPage − printedPage. */
  offset: number;
  pageHeight: PageHeight;
  lastPage: number;
};

/**
 * Builds the structure from the table of contents: its units, topics and blocks in its order,
 * each starting where its title appears as a heading on (or next to) the page the contents
 * give. A unit starts at its opener page (its title, set large, just before its first entry).
 * Nothing depends on one layout's font sizes or badges, so books the heading classifier does
 * not know still split.
 */
export function structureFromContents({
  contents,
  lines,
  body,
  offset,
  pageHeight,
  lastPage,
}: Input): Pick<TextbookStructure, 'units' | 'backMatter'> & {
  warnings: string[];
  counts: Record<string, number>;
} {
  const byPage = candidates(
    lines.filter((l) => !contents.pages.includes(l.page)),
    body,
  );
  const warnings: string[] = [];
  const events: HeadingEvent[] = [];
  let prev: Position = { page: 0, y: Infinity, top: 0 };
  const inOrder = (p: Position) => p.page > prev.page || (p.page === prev.page && p.y <= prev.y);
  const topOf = (page: number): Position => ({ page, y: heightOf(pageHeight, page), top: 0 });
  const push = (event: HeadingEvent) => {
    events.push(event);
    prev = { page: event.page, y: event.y, top: event.top };
  };
  // A position before the previous node would break page ranges: keep the contents' order.
  const ordered = (p: Position, title: string): Position => {
    if (inOrder(p)) return p;
    warnings.push(`səh. ${p.page}: "${title}" mündəricatdakı sıraya uyğun gəlmir`);
    return inOrder(topOf(p.page)) ? topOf(p.page) : prev;
  };
  const place = (entry: ContentsEntry, skip?: (c: Candidate) => boolean) => {
    const page = entry.printedPage + offset;
    const found = locate(entry.title, [page, page + 1, page - 1], byPage, {
      minSize: body * HEADING,
      match: MATCH,
      skip,
    });
    if (!found)
      warnings.push(
        `səh. ${page}: "${entry.title}" başlığı mətndə tapılmadı; mündəricatdakı səhifədən başladı`,
      );
    const at = found
      ? {
          page: found.page,
          y: found.y,
          top: Math.max(0, heightOf(pageHeight, found.page) - found.y - found.size * 1.2),
        }
      : topOf(page);
    const title = found && isSuspicious(entry.title) ? found.text : entry.title;
    return { ...ordered(at, entry.title), title };
  };
  const block = (entry: ContentsEntry, bookLevel?: true) => {
    const at = place(entry);
    push({
      type: 'block',
      kind: entry.kind ?? 'other',
      ...at,
      ...(bookLevel ? { bookLevel } : {}),
    });
  };

  contents.front.forEach((e) => block(e));
  for (const unit of contents.units) {
    const first = unit.entries[0];
    if (!first) continue;
    const firstPage = first.printedPage + offset;
    // The entry's own page first, then the pages before it, then the one after.
    const pages = [
      ...Array.from({ length: OPENER_PAGES + 1 }, (_, i) => firstPage - i),
      firstPage + 1,
    ];
    const opener = locate(unit.title, pages, byPage, {
      minSize: body * UNIT_HEADING,
      match: UNIT_MATCH,
    });
    push({
      type: 'unit',
      title: unit.title,
      ...ordered(topOf(opener?.page ?? firstPage), unit.title),
    });
    // The opener's own title lines are not a topic heading, even when they read alike.
    const skip = (c: Candidate) =>
      c.page === opener?.page && c.ys.some((y) => opener.ys.includes(y));
    for (const entry of unit.entries) {
      if (entry.kind) block(entry);
      else push({ type: 'topic', ...place(entry, skip) });
    }
  }
  contents.back.forEach((e) => block(e, true));

  const built = buildStructure({ events, pageHeight, lastPage });
  // Units take their printed digit (when every unit has one, in order); topics their printed
  // number, else their place in the unit.
  const digits = contents.units.map((u) => u.number);
  const useDigits = digits.every((d, i) => d !== null && (i === 0 || d > (digits[i - 1] ?? 0)));
  const counts: Record<string, number> = {};
  built.units.forEach((unit, k) => {
    const source = contents.units[k];
    unit.index = useDigits ? (digits[k] ?? k + 1) : k + 1;
    const printed = (source?.entries ?? []).filter((e) => e.kind === null).map((e) => e.number);
    let n = 0;
    for (const item of unit.items) {
      if (item.type !== 'topic') continue;
      const number = printed[n];
      n++;
      item.number = number && TOPIC_NUMBER.test(number) ? number : `${unit.index}.${n}`;
    }
    counts[String(unit.index)] = n;
  });
  return {
    units: built.units,
    backMatter: built.backMatter,
    warnings: [...built.warnings, ...warnings],
    counts,
  };
}
