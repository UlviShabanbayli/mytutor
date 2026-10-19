import { z } from 'zod';
import { lessonTextEstimateSchema, savedResponseSchema, topicLessonSchema } from '@mytutor/schemas';
import type { TopicLesson } from '@mytutor/types';
import { contentUrl, runAction } from '@/features/content/api';

/** A curriculum lesson on one textbook topic. */
export type LessonRef = { curriculumId: string; bookId: string; number: string };

const textAction = ({ curriculumId, bookId, number }: LessonRef, ...step: string[]) => [
  'curricula',
  curriculumId,
  'lessons',
  bookId,
  number,
  'text',
  ...step,
];

export async function fetchLesson(path: string): Promise<TopicLesson | null> {
  const res = await fetch(contentUrl(path));
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`${res.status} ${path}`);
  return topicLessonSchema.parse(await res.json());
}

/** What writing the lesson text would cost; nothing is called or written. */
export const estimateLessonText = (ref: LessonRef) =>
  runAction(textAction(ref, 'estimate'), lessonTextEstimateSchema);

/** Claude writes a new draft of the lesson text (paid). */
export const writeLessonText = (ref: LessonRef) =>
  runAction(textAction(ref), z.object({ updatedAt: z.string(), costUsd: z.number() }));

/** Approves the draft (it becomes the lesson text) or drops it. */
export const decideLessonDraft = (ref: LessonRef, approve: boolean) =>
  runAction(textAction(ref, approve ? 'approve' : 'discard'), savedResponseSchema);
