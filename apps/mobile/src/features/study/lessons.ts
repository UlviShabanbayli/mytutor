import type { StudyLesson } from './types';

/** "riyaziyyat-7-4-3", "m7-4.3" or "4.3" → "4.3": the topic number at the end of an id. */
export function topicCodeOf(id: string): string | null {
  const match = /(\d+)[._-](\d+)$/.exec(id);
  return match ? `${match[1]}.${match[2]}` : null;
}

/** The lesson with this id, or the one of the topic the id names (other areas' topic ids). */
export function findLesson(lessons: StudyLesson[], id: string): StudyLesson | null {
  const code = topicCodeOf(id);
  return lessons.find((l) => l.id === id) ?? lessons.find((l) => l.topicCode === code) ?? null;
}

/** The four steps of a lesson, in order (architecture "Öyrənmə modeli"). */
export const LESSON_STEPS = ['video', 'text', 'example', 'exercise'] as const;
export type LessonStepName = (typeof LESSON_STEPS)[number];

/** The `step` search parameter (1–4) as a step index 0–3; anything else is the first step. */
export function stepIndexOf(param: string | undefined): number {
  const n = Number(param);
  return Number.isInteger(n) && n >= 1 && n <= LESSON_STEPS.length ? n - 1 : 0;
}
