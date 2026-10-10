import type { TextbookBlock, TextbookStructure, TextbookTopic, TextbookUnit } from '@mytutor/types';
import type { HeadingEvent } from './classify';
import type { TocEntry } from './toc';
import { isSuspicious } from './repair';

type Node = { page: number; y: number; top: number; setEnd: (page: number, y: number) => void };
type Ranged = { startPage: number; endPage: number; startY?: number; endY?: number };

type BuildInput = {
  events: HeadingEvent[];
  pageHeight: number;
  /** Last page that belongs to the book body (back cover excluded). */
  lastPage: number;
};

const round = (n: number) => Math.round(n * 10) / 10;

/** A heading this close to the top starts on a fresh page, so the previous node ends earlier. */
const TOP_OF_PAGE = 0.78;

/**
 * Builds the unit → topic/block → section tree from heading events and assigns page ranges.
 * Units end with their STEAM page; blocks after that and before the next unit are back matter.
 */
export function buildStructure({ events, pageHeight, lastPage }: BuildInput) {
  const units: TextbookUnit[] = [];
  const backMatter: TextbookBlock[] = [];
  const nodes: Node[] = [];
  const warnings: string[] = [];
  let unit: TextbookUnit | null = null;
  let topic: TextbookTopic | null = null;
  let closed = false;

  const track = (e: HeadingEvent, target: Ranged, withY: boolean) => {
    if (withY) target.startY = round(e.top);
    nodes.push({
      page: e.page,
      y: e.y,
      top: e.top,
      setEnd: (p, y) => {
        target.endPage = Math.max(p, target.startPage);
        if (withY) target.endY = round(y);
      },
    });
  };

  for (const e of events) {
    if (isSuspicious(e.title))
      warnings.push(`səh. ${e.page}: "${e.title}" başlığında tanınmayan simvol var`);
    if (e.type === 'unit') {
      unit = {
        index: units.length + 1,
        title: e.title,
        startPage: e.page,
        endPage: e.page,
        items: [],
      };
      units.push(unit);
      topic = null;
      closed = false;
      track(e, unit, false);
    } else if (e.type === 'topic') {
      if (!unit) {
        warnings.push(`səh. ${e.page}: "${e.title}" mövzusu heç bir bölməyə aid deyil`);
        continue;
      }
      const count = unit.items.filter((i) => i.type === 'topic').length;
      topic = {
        type: 'topic',
        number: `${unit.index}.${count + 1}`,
        title: e.title,
        startPage: e.page,
        endPage: e.page,
        sections: [],
      };
      unit.items.push(topic);
      track(e, topic, true);
    } else if (e.type === 'block') {
      const block: TextbookBlock = {
        type: 'block',
        kind: e.kind,
        title: e.title,
        startPage: e.page,
        endPage: e.page,
      };
      if (unit && !closed) unit.items.push(block);
      else backMatter.push(block);
      if (e.kind === 'steam') closed = true;
      topic = null;
      track(e, block, true);
    } else if (topic) {
      topic.sections.push({ title: e.title, page: e.page });
    }
  }

  nodes.forEach((node, i) => {
    const next = nodes[i + 1];
    if (!next) return node.setEnd(lastPage, pageHeight);
    // A node that starts at the top of a page leaves the previous page to its predecessor.
    if (next.y >= pageHeight * TOP_OF_PAGE) node.setEnd(next.page - 1, pageHeight);
    else node.setEnd(next.page, next.top);
  });
  for (const u of units) u.endPage = Math.max(u.startPage, ...u.items.map((i) => i.endPage));

  return { units, backMatter, warnings };
}

const letters = (s: string) => s.toLocaleLowerCase('az').replace(/[^\p{L}\p{N}]/gu, '');

/** Letter-bigram overlap (Dice) of two titles, ignoring case, spaces and punctuation. */
function similarity(a: string, b: string): number {
  const grams = (s: string) => {
    const t = letters(s);
    return new Map(
      Array.from({ length: Math.max(0, t.length - 1) }, (_, i) => t.slice(i, i + 2)).reduce(
        (m, g) => m.set(g, (m.get(g) ?? 0) + 1),
        new Map<string, number>(),
      ),
    );
  };
  const x = grams(a);
  const y = grams(b);
  let shared = 0;
  for (const [g, n] of x) shared += Math.min(n, y.get(g) ?? 0);
  const total = [...x.values(), ...y.values()].reduce((t, n) => t + n, 0);
  return total ? (2 * shared) / total : 0;
}

/**
 * Gives detected topics the numbers printed in the table of contents, and the contents title
 * when the heading could not be read (or differs from it only in spacing). Blocks (İlkin
 * yoxlama, STEAM, Sözlük, …) take the contents title when one starts on the same page and reads
 * alike. Matching is by printed page, never by position, so a missed or extra heading does not
 * shift every number after it. A unit takes the number its topics share (part 2 of a book
 * continues with units 6–10). Returns warnings and the heading titles the contents replaced.
 */
export function applyToc(
  units: TextbookUnit[],
  backMatter: TextbookBlock[],
  entries: TocEntry[],
  printedPageOffset: number | null,
): { warnings: string[]; replaced: string[] } {
  const warnings: string[] = [];
  const replaced: string[] = [];
  if (!entries.length || printedPageOffset === null) return { warnings, replaced };
  const used = new Set<TocEntry>();
  const topics = entries.filter((e) => e.number !== null && e.printedPage !== null);
  const blocks = entries.filter((e) => e.number === null && e.printedPage !== null);
  const retitle = (target: { title: string }, title: string) => {
    if (target.title === title) return;
    replaced.push(target.title);
    target.title = title;
  };

  for (const unit of units) {
    for (const item of unit.items) {
      if (item.type !== 'topic') continue;
      const printed = item.startPage - printedPageOffset;
      const entry =
        topics.find((e) => !used.has(e) && e.printedPage === printed) ??
        topics.find((e) => !used.has(e) && Math.abs((e.printedPage ?? 0) - printed) === 1);
      if (!entry?.number) {
        warnings.push(
          `səh. ${item.startPage}: "${item.title}" mövzusu mündəricatda tapılmadı (${item.number})`,
        );
        continue;
      }
      used.add(entry);
      item.number = entry.number;
      if (isSuspicious(item.title) || letters(item.title) === letters(entry.title))
        retitle(item, entry.title);
    }
    const prefixes = new Set(
      unit.items.flatMap((i) => (i.type === 'topic' ? [i.number.split('.')[0]] : [])),
    );
    const [prefix] = [...prefixes];
    if (prefixes.size === 1 && prefix) unit.index = Number(prefix);
  }

  const allBlocks = [
    ...units.flatMap((u) => u.items.filter((i): i is TextbookBlock => i.type === 'block')),
    ...backMatter,
  ];
  for (const block of allBlocks) {
    const printed = block.startPage - printedPageOffset;
    const best = blocks
      .filter((e) => !used.has(e) && e.printedPage === printed)
      .map((e) => ({
        e,
        score: letters(e.title).startsWith(letters(block.title))
          ? 1
          : similarity(e.title, block.title),
      }))
      .sort((a, b) => b.score - a.score)[0];
    if (!best || best.score < 0.6) continue;
    used.add(best.e);
    retitle(block, best.e.title);
  }

  for (const e of topics)
    if (!used.has(e))
      warnings.push(
        `Mündəricatdakı ${e.number} "${e.title}" (səh. ${e.printedPage}) mətndə tapılmadı`,
      );
  return { warnings, replaced };
}

/** Compares topic counts per unit with the table of contents. */
export function validate(
  units: TextbookUnit[],
  tocCounts: Record<string, number>,
): Pick<TextbookStructure['validation'], 'detectedTopicCounts' | 'warnings'> {
  const detectedTopicCounts: Record<string, number> = {};
  for (const u of units)
    detectedTopicCounts[String(u.index)] = u.items.filter((i) => i.type === 'topic').length;
  const warnings: string[] = [];
  const keys = new Set([...Object.keys(tocCounts), ...Object.keys(detectedTopicCounts)]);
  for (const k of keys) {
    if (tocCounts[k] !== detectedTopicCounts[k]) {
      warnings.push(
        `Bölmə ${k}: mündəricatda ${tocCounts[k] ?? 0} mövzu, tapılan ${detectedTopicCounts[k] ?? 0}`,
      );
    }
  }
  if (Object.keys(tocCounts).length === 0)
    warnings.push('Mündəricat səhifəsi tapılmadı; mövzu sayı yoxlanmadı');
  return { detectedTopicCounts, warnings };
}
