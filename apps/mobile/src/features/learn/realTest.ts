import type { Topic } from '@mytutor/types';

/**
 * DEMO MAPPING, temporary: the published tests (the API's `tests/subjects/:id` topics, whose
 * ids are test ids) are test-book sections, not curriculum topics yet. Until topics come from
 * the curriculum API with their own tests, each demo topic or unit gets one real test by
 * position, so the real 145 questions stay reachable from the hive. Not a content claim.
 */
export function pickRealTest(apiTopics: Topic[], position: number): Topic | null {
  const withQuestions = apiTopics.filter((t) => t.questionCount > 0);
  if (withQuestions.length === 0) return null;
  return withQuestions[Math.abs(position) % withQuestions.length] ?? null;
}
