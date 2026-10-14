import { effectiveContent, itemDecisions } from '@mytutor/schemas';
import type { KnowledgeItem, TopicReview, TopicSource } from '@mytutor/types';

/** A textbook example or exercise as a lesson shows it: approved, corrected, with its pages. */
export type MaterialEntry = {
  item: KnowledgeItem;
  /** Printed page numbers the item is read from, in order. */
  pages: number[];
};

export type LessonMaterial = {
  /** Worked examples with the book's own solutions. */
  examples: MaterialEntry[];
  exercises: MaterialEntry[];
  /** Knowledge items of the topic, and how many of them are approved. */
  total: number;
  approved: number;
};

/** "9–10, 12": runs of consecutive pages joined. */
export function pageList(pages: number[]): string {
  const runs: [number, number][] = [];
  for (const page of pages) {
    const last = runs[runs.length - 1];
    if (last && page === last[1] + 1) last[1] = page;
    else runs.push([page, page]);
  }
  return runs.map(([from, to]) => (from === to ? `${from}` : `${from}–${to}`)).join(', ');
}

const pagesOf = (item: KnowledgeItem) =>
  [...new Set(item.sources.flatMap((s) => s.regions.map((r) => r.printedPage ?? r.page)))].sort(
    (a, b) => a - b,
  );

/** Printed pages each item is read from, by item id. */
export const itemPages = (items: KnowledgeItem[]) =>
  new Map(items.map((item) => [item.id, pagesOf(item)]));

/**
 * What a lesson takes from a topic's knowledge: only items an editor approved, with the
 * editor's correction when there is one, in the order their blocks appear in the book.
 */
export function lessonMaterial(
  items: KnowledgeItem[],
  review: Pick<TopicReview, 'items' | 'blocks'> | null,
  source: Pick<TopicSource, 'blocks'>,
): LessonMaterial {
  const decisions = itemDecisions(items, review);
  const blockOrder = new Map(source.blocks.map((b, i) => [b.id, i]));
  const firstBlock = (item: KnowledgeItem) =>
    blockOrder.get(item.sources[0]?.blockId ?? '') ?? Number.MAX_SAFE_INTEGER;

  const approved = items
    .filter((item) => decisions.get(item.id)?.decision === 'approved')
    .map((item) => ({ ...item, content: effectiveContent(item, decisions.get(item.id)) }))
    .sort((a, b) => firstBlock(a) - firstBlock(b));
  const entries = (type: KnowledgeItem['type']) =>
    approved.filter((item) => item.type === type).map((item) => ({ item, pages: pagesOf(item) }));

  return {
    examples: entries('worked_example'),
    exercises: entries('exercise'),
    total: items.length,
    approved: approved.length,
  };
}
