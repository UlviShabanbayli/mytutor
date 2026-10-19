import { extractedItemSchema } from '@mytutor/schemas';
import type {
  ExtractedItem,
  KnowledgeDocument,
  KnowledgeItem,
  KnowledgeItemType,
  KnowledgeStatus,
  SourceFigure,
  TopicSource,
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

/** The figures an item cites (by the model or linked by rule), in citation order. */
export function figuresOf(item: KnowledgeItem, source: TopicSource): SourceFigure[] {
  const ids = [...new Set(item.sources.flatMap((s) => (s.figureId ? [s.figureId] : [])))];
  return ids
    .map((id) => source.figures.find((f) => f.id === id))
    .filter((f): f is SourceFigure => f !== undefined);
}

/** CSS pixels per PDF point: a figure is shown at its printed size. */
const PX_PER_PT = 96 / 72;
/** The card's `max-h-48` (12rem): a taller figure is shown smaller, in proportion. */
const FIGURE_MAX_HEIGHT_PX = 192;

/** Display width of a figure in CSS pixels: printed size, narrowed so its height fits. */
export function figureWidth({ width, height }: SourceFigure['region']['bbox']): number {
  const printed = width * PX_PER_PT;
  return Math.round(
    height > 0 ? Math.min(printed, (FIGURE_MAX_HEIGHT_PX * width) / height) : printed,
  );
}

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
  // Each call keeps the tokens and cost of producing its result, also when reused from cache.
  const fresh = doc.aiCalls.filter((c) => !c.cached);
  const sum = (key: 'inputTokens' | 'outputTokens' | 'cacheReadTokens' | 'cacheCreationTokens') =>
    doc.aiCalls.reduce((total, c) => total + c[key], 0);
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
