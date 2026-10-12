import type { TextbookBlockKind } from '@mytutor/types';
import { blockKind, hasWord } from './classify';
import { numberText, repairBody } from './repair';
import type { TextItem } from './types';

/**
 * A table-of-contents reader that does not depend on one publisher's layout, for books the
 * TRİMS reader (`toc.ts`) does not recognise: topics without printed numbers, units marked by a
 * large digit beside their title, several columns. It relies on what nearly every contents page
 * has: entries that end in a page number (after a dot leader, or in a column of page numbers),
 * and unit titles set larger than the entries.
 */

export type ContentsEntry = {
  /** Printed topic number ("1.2") when the book prints one. */
  number: string | null;
  title: string;
  printedPage: number;
  /** null for a topic; a block kind for review pages, answers and the like. */
  kind: TextbookBlockKind | null;
};

export type ContentsUnit = {
  /** The unit's number: the digit printed beside its title, or its topics' number prefix. */
  number: number | null;
  title: string;
  entries: ContentsEntry[];
};

export type Contents = {
  /** PDF pages the contents are printed on. */
  pages: number[];
  /** Entries listed before the first unit. */
  front: ContentsEntry[];
  units: ContentsUnit[];
  /** Answers, cross-unit reviews and the like, listed after the last unit's own entries. */
  back: ContentsEntry[];
};

type Row = { page: number; y: number; size: number; parts: TextItem[] };
/** Runs of one row joined; `textX` is where its first word starts (after a topic number). */
type Segment = { page: number; text: string; x: number; textX: number; y: number; size: number };
/** Left and right edges that page numbers line up on. */
type Edges = { left: number[]; right: number[] };

/** "Title ........ 71": a dot leader and the page number end an entry. */
const ENTRY_END = /^(.*?\p{L}.*?)(?:\s*[.·…_]){3,}\s*(\d{1,3})$/u;
const LEADER_TAIL = /(?:[.·…_]\s*){3,}\d{1,3}\s*$/u;
/** Some layouts set the page number in the title's own run: "Mərkəzi bucaq 29". */
const TRAILING_PAGE = /^(.*\p{L}.*?)\s+(\d{1,3})$/u;
const PAGE = /^\d{1,3}$/;
const NUMBERED = /^(\d{1,2}(?:\.\d{1,2})+)\.?\s+(.+)$/;
const CONTENTS_TITLE = /^(mündəricat|mündəricə|məzmun|içindəkilər)$/u;
/** Book-level pages a contents lists after the last unit. */
const BOOK_LEVEL =
  /^(cavablar|lüğət|sözlük|terminlər lüğəti|ədəbiyyat|istifadə olunmuş ədəbiyyat|özünüzü yoxlayın)$|bölmələr üzrə/u;
/** Contents are printed in the first or the last pages of a book. */
const FIRST_PAGES = 20;
const LAST_PAGES = 15;
const MIN_ENTRIES = 6;
/** Share of a contents page's entries listed in page order. */
const MIN_ORDERED = 0.8;
/** Rows whose baselines differ by less than this share of their size are one row. */
const SAME_ROW = 0.35;
/** A unit digit may sit this far left of its column. */
const DIGIT_LEFT = 25;
const ALIGNED = 6;
/** Entry starts closer than this belong to one column (a number column and a title column). */
const COLUMN_GAP = 60;

const textOf = (i: TextItem) => {
  const number = numberText(i).trim();
  return (/^[\d\s.]+$/.test(number) ? number : i.decoded ? i.text : repairBody(i.text)).trim();
};
const lower = (s: string) => s.toLocaleLowerCase('az').trim();
const median = (values: number[]) =>
  [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];

/** The column an x position falls in (a unit digit may sit a little left of its column). */
const columnAt = (starts: number[], x: number) =>
  Math.max(
    0,
    starts.findLastIndex((start) => x + DIGIT_LEFT >= start),
  );

/** Runs on one baseline and of similar size; once the columns are known, within one column. */
function rowsOf(items: TextItem[], starts: number[] = []): Row[] {
  const rows: (Row & { column: number })[] = [];
  for (const i of [...items].sort((a, b) => a.page - b.page || b.y - a.y || a.x - b.x)) {
    const column = columnAt(starts, i.x);
    const row = rows.find(
      (r) =>
        r.page === i.page &&
        r.column === column &&
        r.parts.some((p) => Math.abs(p.y - i.y) <= i.size * SAME_ROW) &&
        Math.abs(r.size - i.size) <= Math.max(r.size, i.size) * 0.15,
    );
    if (row) row.parts.push(i);
    else rows.push({ page: i.page, y: i.y, size: i.size, parts: [i], column });
  }
  for (const row of rows) row.parts.sort((a, b) => a.x - b.x);
  return rows;
}

/** Groups values lying within `tolerance` of their neighbours; keeps groups of `min` or more. */
function clusters(values: number[], tolerance: number, min: number): number[][] {
  const groups: number[][] = [];
  for (const v of [...values].sort((a, b) => a - b)) {
    const last = groups.at(-1);
    if (last && v - (last.at(-1) ?? v) <= tolerance) last.push(v);
    else groups.push([v]);
  }
  return groups.filter((g) => g.length >= min);
}

/** Page-number columns: lone numbers whose left or right edges line up. */
function edgesOf(rows: Row[]): Edges {
  const numbers = rows.flatMap((r) => r.parts).filter((p) => PAGE.test(textOf(p)));
  const centres = (values: number[]) => clusters(values, 3, 3).map((g) => median(g) ?? 0);
  return {
    left: centres(numbers.map((p) => p.x)),
    right: centres(numbers.map((p) => p.x + p.width)),
  };
}

/**
 * Joins a row's runs into segments. A finished entry ("…… 7") or a column start ends a
 * segment; so does a wide gap, wider once the columns are known (formula runs leave gaps
 * inside a title). A number in a page-number column ends its row's entry as "... 7" would.
 */
function segmentsOf(row: Row, edges: Edges, starts: number[] = []): Segment[] {
  const gapLimit = starts.length ? 3 : 2;
  const onEdge = (p: TextItem) =>
    edges.left.some((x) => Math.abs(p.x - x) <= 3) ||
    edges.right.some((x) => Math.abs(p.x + p.width - x) <= 3);
  const out: Segment[] = [];
  let current: Segment | null = null;
  let end = -Infinity;
  for (const p of row.parts) {
    const piece = textOf(p);
    const open = current && !LEADER_TAIL.test(current.text);
    if (current && open && PAGE.test(piece) && onEdge(p) && /\p{L}/u.test(current.text)) {
      current.text = `${current.text} ... ${piece}`;
      end = p.x + p.width;
      continue;
    }
    const gap = p.x - end;
    const column = starts.some((x) => Math.abs(p.x - x) <= ALIGNED && p.x - (current?.x ?? 0) > 20);
    if (!current || !open || gap > row.size * gapLimit || column) {
      current = { page: p.page, text: piece, x: p.x, textX: Number.NaN, y: row.y, size: row.size };
      out.push(current);
    } else current.text += gap > p.size * 0.2 ? ` ${piece}` : piece;
    if (Number.isNaN(current.textX) && /\p{L}/u.test(piece)) current.textX = p.x;
    end = p.x + p.width;
  }
  return out.map((s) => ({
    ...s,
    text: s.text.replace(/\s+/g, ' ').trim(),
    textX: Number.isNaN(s.textX) ? s.x : s.textX,
  }));
}

/** Entry text size, and the left edges of the columns entries line up on. */
function layoutOf(list: Segment[]) {
  const ends = list.filter((s) => entryEnd(s.text));
  const entrySize = median(ends.map((s) => s.size)) ?? 0;
  const sameSize = (s: Segment) => Math.abs(s.size - entrySize) <= entrySize * 0.12;
  const groups = clusters(
    ends.filter(sameSize).map((s) => s.x),
    COLUMN_GAP,
    3,
  );
  return { ends, entrySize, sameSize, starts: groups.map((g) => g[0] ?? 0) };
}

function entryOf(title: string, printedPage: number): ContentsEntry {
  const clean = title.replace(/\s+/g, ' ').trim();
  const numbered = NUMBERED.exec(clean);
  const text = numbered?.[2] ?? clean;
  return { number: numbered?.[1] ?? null, title: text, printedPage, kind: blockKind(text) };
}

/** An entry's end: a title with a word in it (not a formula line ending "= 20"), and its page. */
function entryEnd(text: string, trailing = false): { title: string; page: number } | null {
  const m = ENTRY_END.exec(text) ?? (trailing ? TRAILING_PAGE.exec(text) : null);
  if (!m?.[1] || !hasWord(m[1]) || /[=+\-−–:<>≈∙·×]$/u.test(m[1].trim())) return null;
  return { title: m[1], page: Number(m[2]) };
}

type Heading = {
  unit: ContentsUnit;
  x: number;
  size: number;
  top: number;
  bottom: number;
  column: number;
};
/** What a contents page lists, in reading order. */
type PageEvent = { unit: ContentsUnit } | { entry: ContentsEntry };

/** Reads one contents page's columns, in reading order. */
function readPage(list: Segment[]): PageEvent[] {
  const events: PageEvent[] = [];
  const { ends, entrySize, sameSize, starts } = layoutOf(list);
  const columnOf = (s: Segment) => columnAt(starts, s.x);
  const headings: Heading[] = [];
  const digits: Segment[] = [];
  starts.forEach((left, column) => {
    const own = list.filter((s) => columnOf(s) === column).sort((a, b) => b.y - a.y);
    // Titles start at the column's left edge, or right of a topic number.
    const textLeft = median(ends.filter((s) => columnOf(s) === column).map((s) => s.textX)) ?? left;
    const aligned = (s: Segment) =>
      Math.abs(s.x - left) <= ALIGNED || Math.abs(s.x - textLeft) <= ALIGNED;
    let pending: Segment[] = [];
    let heading: Heading | null = null;
    for (const s of own) {
      if (sameSize(s) && aligned(s)) {
        heading = null;
        const end = entryEnd(s.text, true);
        const last = pending.at(-1);
        if (last && last.y - s.y > entrySize * 2.5) pending = [];
        if (!end) {
          pending = [...pending, s].slice(-3);
          continue;
        }
        events.push({
          entry: entryOf([...pending.map((p) => p.text), end.title].join(' '), end.page),
        });
        pending = [];
      } else if (
        s.size >= entrySize * 1.1 &&
        hasWord(s.text) &&
        !CONTENTS_TITLE.test(lower(s.text).replace(/\s+/g, ''))
      ) {
        pending = [];
        const joins =
          heading &&
          Math.abs(heading.size - s.size) <= s.size * 0.1 &&
          heading.bottom - s.y <= s.size * 1.8;
        if (heading && joins) {
          heading.unit.title = `${heading.unit.title} ${s.text}`;
          heading.bottom = s.y;
        } else {
          const unit: ContentsUnit = { number: null, title: s.text, entries: [] };
          heading = { unit, x: s.x, size: s.size, top: s.y, bottom: s.y, column };
          headings.push(heading);
          events.push({ unit });
        }
      } else if (/^\d{1,2}$/.test(s.text) && s.size >= entrySize * 1.4) digits.push(s);
    }
  });
  // A unit's digit is printed left of its title, level with one of its lines or between them
  // (a large number right of the title is the unit's page).
  for (const d of digits) {
    const near = headings
      .filter((h) => h.column === columnOf(d) && d.x < h.x)
      .filter((h) => d.y <= h.top + h.size && d.y >= h.bottom - h.size)
      .sort((a, b) => Math.abs(a.top - d.y) - Math.abs(b.top - d.y))[0];
    if (near && near.unit.number === null) near.unit.number = Number(d.text);
  }
  return events;
}

/** Share of entries whose page is not below the one before: contents follow the book's order. */
function orderedShare(entries: ContentsEntry[]): number {
  const pairs = entries.slice(1).filter((e, i) => e.printedPage >= (entries[i]?.printedPage ?? 0));
  return entries.length > 1 ? pairs.length / (entries.length - 1) : 0;
}

/** Reads the table of contents; `pages` is empty when no contents page was found. */
export function readContents(items: TextItem[], pageCount: number): Contents {
  const near = items.filter((i) => i.page <= FIRST_PAGES || i.page > pageCount - LAST_PAGES);
  const byPage = new Map<number, TextItem[]>();
  for (const i of near) byPage.set(i.page, [...(byPage.get(i.page) ?? []), i]);

  const found: { page: number; events: PageEvent[]; entries: number }[] = [];
  for (const [page, pageItems] of [...byPage].sort((a, b) => a[0] - b[0])) {
    const rows = rowsOf(pageItems);
    const edges = edgesOf(rows);
    const first = rows.flatMap((r) => segmentsOf(r, edges));
    if (first.filter((s) => entryEnd(s.text)).length < MIN_ENTRIES) continue;
    // Second pass: rows rebuilt with the page's columns known.
    const { starts } = layoutOf(first);
    const events = readPage(rowsOf(pageItems, starts).flatMap((r) => segmentsOf(r, edges, starts)));
    const entries = events.flatMap((e) => ('entry' in e ? [e.entry] : []));
    if (entries.length >= MIN_ENTRIES && orderedShare(entries) >= MIN_ORDERED)
      found.push({ page, events, entries: entries.length });
  }
  // Contents pages follow each other: the run of consecutive pages listing the most entries.
  const runs: (typeof found)[] = [];
  for (const f of found) {
    const run = runs.at(-1);
    if (run && f.page - (run.at(-1)?.page ?? 0) === 1) run.push(f);
    else runs.push([f]);
  }
  const total = (run: typeof found) => run.reduce((n, f) => n + f.entries, 0);
  const best = runs.sort((a, b) => total(b) - total(a))[0] ?? [];

  const state: { units: ContentsUnit[]; front: ContentsEntry[] } = { units: [], front: [] };
  for (const event of best.flatMap((f) => f.events)) {
    if ('unit' in event) state.units.push(event.unit);
    else (state.units.at(-1)?.entries ?? state.front).push(event.entry);
  }
  const pages = best.map((f) => f.page);

  const units = state.units
    .filter((u) => u.entries.length > 0)
    .map((u) => {
      // No digit beside the title: the number its topics share ("6.1", "6.2" → 6).
      const prefixes = new Set(
        u.entries.flatMap((e) => (e.number ? [e.number.split('.')[0]] : [])),
      );
      const [prefix] = [...prefixes];
      const number = u.number ?? (prefixes.size === 1 && prefix ? Number(prefix) : null);
      return { ...u, number, title: u.title.replace(/\s+/g, ' ').trim() };
    });

  // Book-level pages at the end of the last unit's list belong to the whole book.
  const back: ContentsEntry[] = [];
  const last = units.at(-1);
  while (last?.entries.length) {
    const entry = last.entries.at(-1);
    if (!entry || !(BOOK_LEVEL.test(lower(entry.title)) || entry.kind === 'answers')) break;
    back.unshift(entry);
    last.entries.pop();
  }
  return { pages, front: state.front, units, back };
}
