import { practiceTestSchema, subjectSchema, topicSchema } from '@mytutor/schemas';
import type { PracticeTest, Subject, Topic } from '@mytutor/types';
import { ApiError, getJson } from '@/lib/api';

// Test practice from the API: the questions published from the team's test books (local only,
// from the content folder), next to the demo world's topic tests under /v1.

export class NotFoundError extends Error {}

/** A demo-world answer, or null when the world has none (a 404): a test or lesson it lacks. */
export async function orNull<T>(work: Promise<T>): Promise<T | null> {
  try {
    return await work;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

const orNotFound = async <T>(work: Promise<T>, what: string): Promise<T> => {
  try {
    return await work;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) throw new NotFoundError(what);
    throw error;
  }
};

export async function fetchSubjects(): Promise<Subject[]> {
  return subjectSchema.array().parse(await getJson('tests/subjects'));
}

export async function fetchTest(testId: string): Promise<PracticeTest> {
  return practiceTestSchema.parse(
    await orNotFound(getJson(`tests/${encodeURIComponent(testId)}`), `Test ${testId} not found`),
  );
}

/** First published topic that has questions: the plan's extra practice when the API has one. */
export async function fetchRecommendedTopic(): Promise<Topic | null> {
  return topicSchema.nullable().parse(await getJson('tests/recommended'));
}
