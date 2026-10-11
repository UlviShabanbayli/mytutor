import type { TextbookBlock, TextbookStructure, TextbookTopic, TextbookUnit } from '@mytutor/types';
import type { HeadingEvent } from './classify';
import { isSuspicious } from './repair';

type Node = { page: number; y: number; setEnd: (page: number) => void };

type BuildInput = {
  events: HeadingEvent[];
  pageHeight: number;
  /** Last page that belongs to the book body (back cover excluded). */
  lastPage: number;
};

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

  const track = (e: HeadingEvent, target: { startPage: number; endPage: number }) =>
    nodes.push({
      page: e.page,
      y: e.y,
      setEnd: (p) => (target.endPage = Math.max(p, target.startPage)),
    });

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
      track(e, unit);
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
      track(e, topic);
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
      track(e, block);
    } else if (topic) {
      topic.sections.push({ title: e.title, page: e.page });
    }
  }

  nodes.forEach((node, i) => {
    const next = nodes[i + 1];
    if (!next) return node.setEnd(lastPage);
    node.setEnd(next.y >= pageHeight * TOP_OF_PAGE ? next.page - 1 : next.page);
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
