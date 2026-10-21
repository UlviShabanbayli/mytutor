import { approvedBlocks, itemDecisions, primaryBlockOf, reviewTier } from '@mytutor/schemas';
import type {
  ItemReview,
  KnowledgeItem,
  SourceBlock,
  TopicReview,
  TopicSource,
} from '@mytutor/types';

export type ReviewBlock = {
  id: string;
  /** Null when the items cite a block the source no longer has. */
  block: SourceBlock | null;
  items: KnowledgeItem[];
  approved: boolean;
  /** Items with no decision yet. */
  open: number;
  /** Flagged items (tier "full") with no decision yet. */
  problems: number;
  /** Derived items (tier "targeted") with no decision yet: compared with the crop one by one. */
  toCompare: number;
};

/** The blocks the review goes through, in reading order, with their items and state. */
export function reviewQueue(
  source: TopicSource,
  items: KnowledgeItem[],
  review: TopicReview | null,
) {
  const decisions = itemDecisions(items, review);
  const approved = approvedBlocks(items, review);
  const byBlock = new Map<string, KnowledgeItem[]>();
  for (const item of items) {
    const id = primaryBlockOf(item);
    if (id) byBlock.set(id, [...(byBlock.get(id) ?? []), item]);
  }
  const order = [
    ...source.blocks.map((b) => b.id).filter((id) => byBlock.has(id)),
    ...[...byBlock.keys()].filter((id) => !source.blocks.some((b) => b.id === id)),
  ];
  const queue: ReviewBlock[] = order.map((id) => {
    const blockItems = byBlock.get(id) ?? [];
    const open = blockItems.filter((item) => !decisions.has(item.id));
    return {
      id,
      block: source.blocks.find((b) => b.id === id) ?? null,
      items: blockItems,
      approved: approved.has(id),
      open: open.length,
      problems: open.filter((item) => reviewTier(item) === 'full').length,
      toCompare: open.filter((item) => reviewTier(item) === 'targeted').length,
    };
  });
  return { queue, decisions };
}

export type ReviewState = { queue: ReviewBlock[]; decisions: Map<string, ItemReview> };

/** The block after `id` that is not approved yet (wrapping around), or null when all are. */
export function nextOpenBlock(queue: ReviewBlock[], id: string | null): ReviewBlock | null {
  const at = queue.findIndex((b) => b.id === id);
  const rest = [...queue.slice(at + 1), ...queue.slice(0, Math.max(at, 0))];
  return rest.find((b) => !b.approved) ?? null;
}
