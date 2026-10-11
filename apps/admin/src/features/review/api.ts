import { savedResponseSchema, topicReviewSchema } from '@mytutor/schemas';
import type { TopicReview, TopicReviewInput } from '@mytutor/types';
import { contentUrl, jsonBody, runAction } from '@/features/content/api';

/** A topic's review decisions; null before the first decision. */
export async function fetchTopicReview(topicDir: string): Promise<TopicReview | null> {
  const res = await fetch(contentUrl(topicDir, 'review.json'));
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`${res.status} ${topicDir}/review.json`);
  return topicReviewSchema.parse(await res.json());
}

export const saveTopicReview = (bookId: string, topic: string, review: TopicReviewInput) =>
  runAction(['books', bookId, 'topics', topic, 'review'], savedResponseSchema, jsonBody(review));
