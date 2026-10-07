import type { PracticeTest, Subject, Topic } from '@mytutor/types';
import { demoSubjects, demoTests, demoTopics } from './demoData';

// Demo data source behind the same async shape the API will have.
// Swap these bodies for API calls once content is imported; hooks stay unchanged.

const DEMO_LATENCY_MS = 300;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), DEMO_LATENCY_MS));
}

export class NotFoundError extends Error {}

export function fetchSubjects(): Promise<Subject[]> {
  return delay(demoSubjects);
}

export async function fetchSubject(
  subjectId: string,
): Promise<{ subject: Subject; topics: Topic[] }> {
  const subject = demoSubjects.find((s) => s.id === subjectId);
  if (!subject) throw new NotFoundError(`Subject ${subjectId} not found`);
  return delay({ subject, topics: demoTopics.filter((t) => t.subjectId === subjectId) });
}

export async function fetchTest(testId: string): Promise<PracticeTest> {
  const test = demoTests.find((t) => t.id === testId);
  if (!test) throw new NotFoundError(`Test ${testId} not found`);
  return delay(test);
}

/** First topic that has questions; used for the "For you" card until we track progress. */
export function fetchRecommendedTopic(): Promise<Topic | null> {
  return delay(demoTopics.find((t) => t.questionCount > 0) ?? null);
}
