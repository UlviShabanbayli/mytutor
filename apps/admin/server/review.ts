import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  extractedItemSchema,
  itemFingerprint,
  knowledgeDocumentSchema,
  topicReviewInputSchema,
} from '@mytutor/schemas';
import type { ItemReview, KnowledgeItem, TopicReview } from '@mytutor/types';
import { scanBooks } from './contentIndex';
import { parseBody, writeJson } from './json';
import { exclusive, PipelineError, topicKey } from './pipeline';
import { REVIEW_FILE } from './topicStatus';

export type SaveTopicReviewInput = {
  root: string;
  bookId: string;
  topic: string;
  body: unknown;
  now?: () => Date;
};

/** Saves the editors' decisions on a topic's knowledge items, next to its source. */
export async function saveTopicReview({
  root,
  bookId,
  topic,
  body,
  now = () => new Date(),
}: SaveTopicReviewInput) {
  const input = parseBody(topicReviewInputSchema, body);
  return exclusive(topicKey(bookId, topic), async () => {
    const book = (await scanBooks(root)).find((b) => b.id === bookId);
    if (!book) throw new PipelineError(404, 'no_book', 'Unknown book');
    const entry = book.topics.find((t) => t.number === topic);
    if (!entry) throw new PipelineError(404, 'no_topic', 'Unknown topic');
    if (!entry.knowledge)
      throw new PipelineError(409, 'no_knowledge', 'The topic has no knowledge document');
    const items = await checkCorrections(join(root, entry.knowledge), input.items);
    const review: TopicReview = { ...input, items, updatedAt: now().toISOString() };
    await writeJson(join(root, entry.dir, REVIEW_FILE), review);
    return { updatedAt: review.updatedAt };
  });
}

const BASE_FIELDS = new Set(['type', 'ref', 'origin', 'readFrom', 'sources']);

/**
 * A correction must be the content of the same kind of item: it is checked against that type's
 * schema, stored without unknown keys, and allowed only on an approved item.
 */
async function checkCorrections(knowledgePath: string, decisions: ItemReview[]) {
  if (!decisions.some((d) => d.correction)) return decisions;
  const bad = (message: string) => new PipelineError(400, 'bad_request', message);
  let items: KnowledgeItem[];
  try {
    items = knowledgeDocumentSchema.parse(JSON.parse(await readFile(knowledgePath, 'utf8'))).items;
  } catch {
    throw new PipelineError(409, 'no_knowledge', 'The knowledge document cannot be read');
  }
  return decisions.map((decision) => {
    if (!decision.correction) return decision;
    if (decision.decision !== 'approved')
      throw bad(`Correction of ${decision.itemId} needs the decision "approved"`);
    const item =
      items.find((i) => i.id === decision.itemId && itemFingerprint(i) === decision.fingerprint) ??
      items.find((i) => itemFingerprint(i) === decision.fingerprint);
    if (!item) throw bad(`Unknown item ${decision.itemId}`);
    const parsed = extractedItemSchema.safeParse({
      ...decision.correction,
      type: item.type,
      ref: item.id,
      origin: item.claimedOrigin,
      readFrom: item.readFrom,
      sources: item.sources.map(({ blockId, lineIds, figureId }) => ({
        blockId,
        lineIds,
        figureId,
      })),
    });
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      throw bad(
        `Correction of ${decision.itemId}: ${issue ? `${issue.path.join('.')} ${issue.message}` : 'invalid'}`,
      );
    }
    const correction = Object.fromEntries(
      Object.entries(parsed.data).filter(([key]) => !BASE_FIELDS.has(key)),
    );
    return { ...decision, correction };
  });
}
