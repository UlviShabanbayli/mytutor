import { practiceTestSchema, subjectSchema, topicSchema } from '@mytutor/schemas';
import type { PracticeTest, Subject, Topic } from '@mytutor/types';
import { ApiError, getJson } from '@/lib/api';

// Test practice from the API: the questions published from the team's test books.

export class NotFoundError extends Error {}

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

export async function fetchSubject(
  subjectId: string,
): Promise<{ subject: Subject; topics: Topic[] }> {
  const data = await orNotFound(
    getJson(`tests/subjects/${encodeURIComponent(subjectId)}`),
    `Subject ${subjectId} not found`,
  );
  const { subject, topics } = data as { subject: unknown; topics: unknown };
  return { subject: subjectSchema.parse(subject), topics: topicSchema.array().parse(topics) };
}

export async function fetchTest(testId: string): Promise<PracticeTest> {
  return practiceTestSchema.parse(
    await orNotFound(getJson(`tests/${encodeURIComponent(testId)}`), `Test ${testId} not found`),
  );
}

/** First topic that has questions; used for the "For you" card until we track progress. */
export async function fetchRecommendedTopic(): Promise<Topic | null> {
  return topicSchema.nullable().parse(await getJson('tests/recommended'));
}
