import { join } from 'node:path';
import { topicReviewInputSchema } from '@mytutor/schemas';
import type { TopicReview } from '@mytutor/types';
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
    const review: TopicReview = { ...input, updatedAt: now().toISOString() };
    await writeJson(join(root, entry.dir, REVIEW_FILE), review);
    return { updatedAt: review.updatedAt };
  });
}
