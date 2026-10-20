import {
  bookAnswersSchema,
  bookLessonSchema,
  curriculumResponseSchema,
  mistakeGroupSchema,
  reviewPlanSchema,
  studyLessonSchema,
  studyTestSchema,
} from '@mytutor/schemas';
import { testIdOf } from '@mytutor/demo-data';
import type {
  CourseTopic,
  CurriculumResponse,
  DemoPersona,
  MistakeGroup,
  ReviewPlan,
  StudyTest,
} from '@mytutor/types';
import { NotFoundError, fetchTest, orNull } from '@/features/tests/api';
import { apiGet } from '@/lib/api';
import { lessonView } from './lessonView';
import { studyTestOf } from './steps';
import type { LessonView } from './types';

/** The study area's reads from the demo world (and the local API's book content). */

const enc = encodeURIComponent;

export const fetchCurriculum = (persona: DemoPersona): Promise<CurriculumResponse> =>
  apiGet('/v1/curriculum', { persona, parse: curriculumResponseSchema.parse });

async function topicOf(persona: DemoPersona, id: string): Promise<CourseTopic | null> {
  const curriculum = await fetchCurriculum(persona);
  const topics = curriculum.textbooks.flatMap((b) =>
    b.volumes.flatMap((v) => v.units.flatMap((u) => u.topics)),
  );
  return topics.find((t) => t.id === id) ?? null;
}

/**
 * A topic's lesson: the book's approved text and answers when the local API has the content
 * folder (a 404 everywhere else), and the demo lesson when the world has one.
 */
export async function fetchLesson(persona: DemoPersona, id: string): Promise<LessonView | null> {
  const [demo, book, answers] = await Promise.all([
    orNull(apiGet(`/v1/lessons/${enc(id)}`, { persona, parse: studyLessonSchema.parse })),
    orNull(apiGet(`/v1/lessons/${enc(id)}/book`, { persona, parse: bookLessonSchema.parse })),
    orNull(apiGet(`/v1/lessons/${enc(id)}/answers`, { persona, parse: bookAnswersSchema.parse })),
  ]);
  const topic = book ? await topicOf(persona, id) : null;
  return lessonView({ demo, book, answers, topic, testId: testIdOf(id) });
}

/**
 * A test session's content: a topic or unit test of the demo world ("test-riyaziyyat-7-4-3"),
 * else a test published from the team's test books (local API only). Null when neither exists.
 */
export async function fetchStudyTest(persona: DemoPersona, id: string): Promise<StudyTest | null> {
  const world = await orNull(
    apiGet(`/v1/tests/${enc(id)}`, { persona, parse: studyTestSchema.parse }),
  );
  if (world) return world;
  try {
    return studyTestOf(await fetchTest(id));
  } catch (error) {
    if (error instanceof NotFoundError) return null;
    throw error;
  }
}

export const fetchReview = (persona: DemoPersona): Promise<ReviewPlan> =>
  apiGet('/v1/review', { persona, parse: reviewPlanSchema.parse });

export const fetchWorldMistakes = (persona: DemoPersona): Promise<MistakeGroup[]> =>
  apiGet('/v1/mistakes', { persona, parse: mistakeGroupSchema.array().parse });
