import type { DemoWorld, MistakeGroup, ReviewPlan, StudyLesson, StudyTest } from '@mytutor/types';

/** GET /v1/lessons/:id, /v1/tests/:id, /v1/review, /v1/mistakes. */

export const selectLesson = (world: DemoWorld, id: string): StudyLesson | null =>
  world.lessons.find((l) => l.id === id) ?? null;

export const selectTest = (world: DemoWorld, id: string): StudyTest | null =>
  world.tests.find((t) => t.test.id === id) ?? null;

export const selectReview = (world: DemoWorld): ReviewPlan => world.review;

export const selectMistakes = (world: DemoWorld): MistakeGroup[] => world.mistakes;
