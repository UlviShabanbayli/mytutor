import { z } from 'zod';
import { gradeSchema, submissionStateSchema } from './assignments';
import { masteryLevelSchema } from './course';
import { dateTimeSchema, pointsSchema } from './people';

/** The "Bu gün" area: today's plan, the unfinished lesson, due work and the motivation numbers. */

/** Where a plan step leads: lessons, tests, review, topics, assignments and mocks. */
export const PLAN_STEP_KINDS = ['review', 'lesson', 'test', 'topic', 'assignment', 'mock'] as const;

/** Why the plan suggests a step; the screen always shows the reason. */
export const planStepReasonSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('crystallized'), daysAgo: z.number().int().nonnegative() }),
  z.object({ kind: z.literal('unfinished'), stepsLeft: z.number().int().positive() }),
  z.object({ kind: z.literal('mistakes'), count: z.number().int().positive() }),
  z.object({ kind: z.literal('questions'), count: z.number().int().positive() }),
  z.object({ kind: z.literal('assignment'), className: z.string().min(1) }),
  z.object({ kind: z.literal('examPlan') }),
]);

export const planStepSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(PLAN_STEP_KINDS),
  /** Id of the lesson, test, topic or assignment the step opens ("review" for review). */
  targetId: z.string().min(1),
  /** Topic number shown in the cell, e.g. "4.3"; null for a test without one. */
  code: z.string().nullable(),
  /** Mastery of the step's topic, drawn as the hex cell. */
  cell: masteryLevelSchema,
  title: z.string().min(1),
  reason: planStepReasonSchema,
  /** Estimated minutes; null when unknown. */
  minutes: z.number().int().positive().nullable(),
  /** Questions in a test step, shown when the minutes are unknown. */
  questionCount: z.number().int().positive().nullable(),
  points: z.number().int().nonnegative(),
});

/** Parts of a lesson (architecture Ş4: text, video, worked examples, exercises). */
export const LESSON_PARTS = ['text', 'video', 'examples', 'exercises'] as const;

/** The unfinished lesson the student left. */
export const unfinishedLessonSchema = z.object({
  lessonId: z.string().min(1),
  code: z.string().min(1),
  title: z.string().min(1),
  subject: z.string().min(1),
  part: z.enum(LESSON_PARTS),
  done: z.number().int().nonnegative(),
  total: z.number().int().positive(),
});

/** A class assignment due soon (architecture Ş10), with where the student is with it. */
export const assignmentDueSchema = z.object({
  id: z.string().min(1),
  className: z.string().min(1),
  subject: z.string().min(1),
  teacher: z.string().min(1),
  title: z.string().min(1),
  dueAt: dateTimeSchema,
  state: submissionStateSchema,
  /** The teacher's grade once checked. */
  grade: gradeSchema.nullable(),
});

/** First day: where to start in the recommended textbook. */
export const firstStepSchema = z.object({
  subjectId: z.string().min(1),
  subject: z.string().min(1),
  firstTopicId: z.string().min(1),
  placementMinutes: z.number().int().positive(),
  firstCellMinutes: z.number().int().positive(),
});

/** The motivation numbers (architecture P2). */
export const motivationSchema = z.object({
  points: pointsSchema,
  streak: z.number().int().nonnegative(),
  shields: z.number().int().nonnegative(),
  dailyMinutes: z.number().int().positive(),
  minutesToday: z.number().int().nonnegative(),
  /** The streak that ended, for the "streak stopped" sheet. */
  endedStreak: z.number().int().nonnegative(),
  restartMinutes: z.number().int().positive(),
  freezesThisWeek: z.number().int().nonnegative(),
  /** What today brought, for the "goal done" moment. */
  todayCells: z.number().int().nonnegative(),
  todayAccuracy: z.number().int().min(0).max(100),
});

/** A topic that crystallized during a long break. */
export const crystalTopicSchema = z.object({
  topicId: z.string().min(1),
  code: z.string().min(1),
  title: z.string().min(1),
});

export const comebackSchema = z.object({
  awayDays: z.number().int().positive(),
  crystals: z.array(crystalTopicSchema),
  reviewMinutes: z.number().int().positive(),
});

/** GET /v1/today. */
export const todayResponseSchema = z.object({
  /** Null for a student who has not given a name. */
  studentName: z.string().nullable(),
  plan: z.array(planStepSchema),
  unfinishedLesson: unfinishedLessonSchema.nullable(),
  assignments: z.array(assignmentDueSchema),
  /** Where a first-day student starts; shown while the hive is empty. */
  firstStep: firstStepSchema,
  motivation: motivationSchema,
  /** What the "welcome back" moment shows after a long break; null with nothing to review. */
  comeback: comebackSchema.nullable(),
});
