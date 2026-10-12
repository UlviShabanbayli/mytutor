import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { itemFingerprint, primaryBlockOf } from '@mytutor/schemas';
import type {
  ContentTopicEntry,
  KnowledgeItem,
  ReviewDecision,
  TopicReview,
  TopicReviewInput,
} from '@mytutor/types';
import { fetchTopicReview, saveTopicReview } from './api';

// Outside ['content']: other actions refresh content, but only this page writes a review, and a
// refetch racing a save must not bring back the state before it.
const reviewKey = (bookId: string, topic: string) => ['review', bookId, topic] as const;

export function useTopicReview(bookId: string, entry: ContentTopicEntry | null) {
  return useQuery({
    queryKey: reviewKey(bookId, entry?.number ?? ''),
    // Without decisions there is no file yet: no request, no 404.
    queryFn: () =>
      entry?.review?.decidedItems || entry?.review?.approvedBlocks
        ? fetchTopicReview(entry.dir)
        : Promise.resolve(null),
    enabled: entry !== null,
  });
}

const EMPTY: TopicReviewInput = { items: [], blocks: [] };

/** Drops an item's decision, whether it was saved under this id or under its content. */
const without = (review: TopicReviewInput, item: KnowledgeItem) => {
  const print = itemFingerprint(item);
  return review.items.filter((d) => d.itemId !== item.id && d.fingerprint !== print);
};

/**
 * Review changes apply to the page at once and are saved one after another, each with the
 * whole review as it stands, so fast clicks never overwrite each other.
 */
export function useReviewActions(bookId: string, topic: string) {
  const queryClient = useQueryClient();
  const key = reviewKey(bookId, topic);
  const save = useMutation({
    mutationFn: (review: TopicReviewInput) => saveTopicReview(bookId, topic, review),
    scope: { id: `review:${bookId}:${topic}` },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['content', 'index'] }),
    // The page may now differ from the disk: read the disk again.
    onError: () => void queryClient.invalidateQueries({ queryKey: key }),
  });
  const apply = (change: (review: TopicReviewInput) => TopicReviewInput) => {
    const current = queryClient.getQueryData<TopicReview | null>(key);
    const next = change(current ? { items: current.items, blocks: current.blocks } : EMPTY);
    queryClient.setQueryData<TopicReview>(key, { ...next, updatedAt: current?.updatedAt ?? '' });
    save.mutate(next);
  };
  const now = () => new Date().toISOString();
  const blockOf = (item: KnowledgeItem) => primaryBlockOf(item);

  return {
    save,
    decide: (item: KnowledgeItem, decision: ReviewDecision, note: string | null = null) =>
      apply((r) => ({
        ...r,
        items: [
          ...without(r, item),
          { itemId: item.id, fingerprint: itemFingerprint(item), decision, note, decidedAt: now() },
        ],
      })),
    /** Takes a decision back; the item's block, if approved, opens again. */
    undo: (item: KnowledgeItem) =>
      apply((r) => ({
        items: without(r, item),
        blocks: r.blocks.filter((b) => b.blockId !== blockOf(item)),
      })),
    decideAll: (items: KnowledgeItem[], decision: ReviewDecision) =>
      apply((r) => ({
        ...r,
        items: [
          ...items.reduce((left, item) => without({ ...r, items: left }, item), r.items),
          ...items.map((item) => ({
            itemId: item.id,
            fingerprint: itemFingerprint(item),
            decision,
            note: null,
            decidedAt: now(),
          })),
        ],
      })),
    approveBlock: (blockId: string, items: KnowledgeItem[]) =>
      apply((r) => ({
        ...r,
        blocks: [
          ...r.blocks.filter((b) => b.blockId !== blockId),
          { blockId, itemFingerprints: items.map(itemFingerprint), approvedAt: now() },
        ],
      })),
    reopenBlock: (blockId: string) =>
      apply((r) => ({ ...r, blocks: r.blocks.filter((b) => b.blockId !== blockId) })),
  };
}

export type ReviewActions = ReturnType<typeof useReviewActions>;
