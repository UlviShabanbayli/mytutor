import type { TextbookBlock, TextbookStructure, TextbookTopic, TextbookUnit } from '@mytutor/types';
import type { HeadingEvent } from './classify';
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
