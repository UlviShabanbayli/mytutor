import { z } from 'zod';
import type { knowledgeItemSchema } from './knowledge';

/**
 * The editors' review of a topic's knowledge document, block by block: a decision per item and
 * the blocks whose items were all decided and approved together. Stored as `review.json` in the
 * topic folder, beside (not inside) the generated knowledge, so rebuilding knowledge keeps it.
 */

export const REVIEW_NOTE_MAX = 1000;

/** approved: shown to students as is; needs_fix: an editor must correct it; rejected: never shown. */
export const reviewDecisionSchema = z.enum(['approved', 'needs_fix', 'rejected']);

export const itemReviewSchema = z.object({
  itemId: z.string(),
  /** The item's content when it was decided (see `itemFingerprint`). */
  fingerprint: z.string(),
  decision: reviewDecisionSchema,
  note: z.string().trim().max(REVIEW_NOTE_MAX).nullable(),
  decidedAt: z.string(),
});

export const blockReviewSchema = z.object({
  blockId: z.string(),
  /** Fingerprints of the block's items when it was approved; a changed item reopens the block. */
  itemFingerprints: z.array(z.string()),
  approvedAt: z.string(),
});

export const topicReviewSchema = z.object({
  items: z.array(itemReviewSchema),
  blocks: z.array(blockReviewSchema),
  updatedAt: z.string(),
});

/** What the panel sends to save a topic's review (the server stamps `updatedAt`). */
export const topicReviewInputSchema = topicReviewSchema.omit({ updatedAt: true });

/** A knowledge document's counts, as the content index lists them. */
export const knowledgeSummarySchema = z.object({
  items: z.number().int().nonnegative(),
  textbook: z.number().int().nonnegative(),
  derived: z.number().int().nonnegative(),
  unverified: z.number().int().nonnegative(),
  /** Items an editor must look at: unverified, or with a failed check. */
  flagged: z.number().int().nonnegative(),
  costUsd: z.number(),
});

/** How far a topic's review got. */
export const reviewProgressSchema = z.object({
  /** Blocks the knowledge items come from: the review goes through these. */
  blocks: z.number().int().nonnegative(),
  approvedBlocks: z.number().int().nonnegative(),
  decidedItems: z.number().int().nonnegative(),
  /** Flagged items with no decision yet. */
  openFlagged: z.number().int().nonnegative(),
});

type Item = z.output<typeof knowledgeItemSchema>;
type ItemReview = z.output<typeof itemReviewSchema>;
type TopicReviewData = Pick<z.output<typeof topicReviewSchema>, 'items' | 'blocks'>;

/** Stable JSON: object keys sorted, so equal content always prints the same. */
function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value && typeof value === 'object')
    return `{${Object.keys(value)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${stable((value as Record<string, unknown>)[k])}`)
      .join(',')}}`;
  return JSON.stringify(value) ?? 'null';
}

/**
 * FNV-1a of an item's type and content. Ids are renumbered when knowledge is rebuilt; the
 * fingerprint finds the same item again, and tells a changed item from the decided one.
 */
export function itemFingerprint(item: Pick<Item, 'type' | 'content'>): string {
  let hash = 0x811c9dc5;
  for (const char of `${item.type}|${stable(item.content)}`) {
    hash ^= char.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

/** The block an item is reviewed with: the first block it cites. */
export const primaryBlockOf = (item: Pick<Item, 'sources'>): string | null =>
  item.sources[0]?.blockId ?? null;

/** Items an editor must look at closely. */
export const isFlagged = (item: Pick<Item, 'status' | 'checks'>): boolean =>
  item.status === 'unverified' || item.checks.some((check) => check.result === 'fail');

/** Each current item's decision: found by id and content, else by content alone. */
export function itemDecisions(
  items: Item[],
  review: TopicReviewData | null,
): Map<string, ItemReview> {
  const decisions = new Map<string, ItemReview>();
  if (!review) return decisions;
  const byPrint = new Map(review.items.map((r) => [r.fingerprint, r]));
  for (const item of items) {
    const print = itemFingerprint(item);
    const same = review.items.find((r) => r.itemId === item.id && r.fingerprint === print);
    const found = same ?? byPrint.get(print);
    if (found) decisions.set(item.id, found);
  }
  return decisions;
}

/** Block id → fingerprints of its items, sorted; the review goes through these blocks in order. */
export function reviewBlocks(items: Item[]): Map<string, string[]> {
  const blocks = new Map<string, string[]>();
  for (const item of items) {
    const block = primaryBlockOf(item);
    if (block) blocks.set(block, [...(blocks.get(block) ?? []), itemFingerprint(item)]);
  }
  for (const prints of blocks.values()) prints.sort();
  return blocks;
}

/** Blocks approved with exactly the items they hold now. */
export function approvedBlocks(items: Item[], review: TopicReviewData | null): Set<string> {
  const approved = new Set<string>();
  if (!review) return approved;
  const blocks = reviewBlocks(items);
  for (const entry of review.blocks) {
    const prints = blocks.get(entry.blockId);
    const same =
      prints?.length === entry.itemFingerprints.length &&
      [...entry.itemFingerprints].sort().every((p, i) => p === prints[i]);
    if (same) approved.add(entry.blockId);
  }
  return approved;
}

export function reviewProgress(
  items: Item[],
  review: TopicReviewData | null,
): z.output<typeof reviewProgressSchema> {
  const decisions = itemDecisions(items, review);
  return {
    blocks: reviewBlocks(items).size,
    approvedBlocks: approvedBlocks(items, review).size,
    decidedItems: decisions.size,
    openFlagged: items.filter((item) => isFlagged(item) && !decisions.has(item.id)).length,
  };
}
