import { readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import type { z } from 'zod';
import {
  isFlagged,
  knowledgeDocumentSchema,
  reviewProgress,
  topicReviewSchema,
} from '@mytutor/schemas';
import type { KnowledgeSummary, ReviewProgress } from '@mytutor/types';

/** The editors' review of a topic, in its topic folder. */
export const REVIEW_FILE = 'review.json';

export type TopicStatus = { summary: KnowledgeSummary | null; review: ReviewProgress | null };

const NONE: TopicStatus = { summary: null, review: null };

// Knowledge documents are large; the index is rebuilt after every action, so each topic's
// status is kept until its knowledge or review file changes.
const cache = new Map<string, { key: string; status: TopicStatus }>();

async function parse<T>(path: string, schema: z.ZodType<T>): Promise<T | null> {
  try {
    const result = schema.safeParse(JSON.parse(await readFile(path, 'utf8')));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

/** Counts from a topic's knowledge document and how far its review got. */
export async function topicStatus(topicDir: string, knowledgePath: string): Promise<TopicStatus> {
  const knowledge = await stat(knowledgePath).catch(() => null);
  if (!knowledge) return NONE;
  const reviewPath = join(topicDir, REVIEW_FILE);
  const review = await stat(reviewPath).catch(() => null);
  const key = `${knowledge.mtimeMs}:${knowledge.size}:${review?.mtimeMs ?? 0}:${review?.size ?? 0}`;
  const hit = cache.get(topicDir);
  if (hit?.key === key) return hit.status;

  const doc = await parse(knowledgePath, knowledgeDocumentSchema);
  if (!doc) return NONE;
  const saved = review ? await parse(reviewPath, topicReviewSchema) : null;
  const count = (status: string) => doc.items.filter((item) => item.status === status).length;
  const status: TopicStatus = {
    summary: {
      items: doc.items.length,
      textbook: count('textbook'),
      derived: count('derived'),
      unverified: count('unverified'),
      flagged: doc.items.filter(isFlagged).length,
      costUsd: doc.summary.costUsd,
    },
    review: reviewProgress(doc.items, saved),
  };
  cache.set(topicDir, { key, status });
  return status;
}
