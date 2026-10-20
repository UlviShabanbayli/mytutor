import type { ClassInsights } from '@mytutor/types';

type Row = ClassInsights['rows'][number];
type Topic = ClassInsights['topics'][number];

/** Index of the topic with the most "needs practice" cells, or null when none needs it. */
export function hardestTopicIndex(rows: Row[], topicCount: number): number | null {
  let best: number | null = null;
  let bestCount = 0;
  for (let i = 0; i < topicCount; i++) {
    const count = rows.filter((r) => r.levels[i] === 'needs_practice').length;
    if (count > bestCount) {
      best = i;
      bestCount = count;
    }
  }
  return best;
}

/**
 * Vızı's scouting suggestion (M7): the students whose cell crystallised on the hardest topic,
 * to be turned into a review assignment with one tap.
 */
export function reviewSuggestion(rows: Row[], topics: Topic[]) {
  const index = hardestTopicIndex(rows, topics.length);
  if (index === null) return null;
  const students = rows.filter((r) => r.levels[index] === 'needs_practice');
  const topic = topics[index];
  if (topic === undefined) return null;
  return { topic, students };
}
