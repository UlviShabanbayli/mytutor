import { extractedItemSchema } from '@mytutor/schemas';
import type {
  ExtractedItem,
  KnowledgeDocument,
  KnowledgeItem,
  KnowledgeItemType,
  KnowledgeStatus,
} from '@mytutor/types';

/**
 * The stored item keeps type-specific fields in `content`; re-joining them with the base
 * fields lets the UI render a typed item. Null when the content does not match the schema.
 */
export function toExtracted(item: KnowledgeItem): ExtractedItem | null {
  const parsed = extractedItemSchema.safeParse({
    ...item.content,
    type: item.type,
    ref: item.id,
    origin: item.claimedOrigin,
    readFrom: item.readFrom,
    sources: item.sources.map(({ blockId, lineIds, figureId }) => ({ blockId, lineIds, figureId })),
  });
  return parsed.success ? parsed.data : null;
}

export const hasFailedCheck = (item: KnowledgeItem) => item.checks.some((c) => c.result === 'fail');

export type KnowledgeFilter = {
  status: KnowledgeStatus | null;
  type: KnowledgeItemType | null;
  failedOnly: boolean;
};

export function filterItems(items: KnowledgeItem[], filter: KnowledgeFilter): KnowledgeItem[] {
  return items.filter(
    (i) =>
      (filter.status === null || i.status === filter.status) &&
      (filter.type === null || i.type === filter.type) &&
      (!filter.failedOnly || hasFailedCheck(i)),
  );
}

/** Item types present in the document, in schema order, with counts. */
export function typeCounts(items: KnowledgeItem[]): [KnowledgeItemType, number][] {
  const counts = new Map<KnowledgeItemType, number>();
  for (const item of items) counts.set(item.type, (counts.get(item.type) ?? 0) + 1);
  return [...counts.entries()];
}

export function callStats(doc: KnowledgeDocument) {
  const fresh = doc.aiCalls.filter((c) => !c.cached);
  const sum = (key: 'inputTokens' | 'outputTokens' | 'cacheReadTokens' | 'cacheCreationTokens') =>
    fresh.reduce((total, c) => total + c[key], 0);
  return {
    total: doc.aiCalls.length,
    fresh: fresh.length,
    cached: doc.aiCalls.length - fresh.length,
    inputTokens: sum('inputTokens') + sum('cacheReadTokens') + sum('cacheCreationTokens'),
    outputTokens: sum('outputTokens'),
    models: [...new Set(doc.aiCalls.map((c) => c.model))],
    failedItems: doc.items.filter(hasFailedCheck).length,
  };
}
