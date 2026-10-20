import { z } from 'zod';
import { masteryLevelSchema } from './course';
import { dateTimeSchema } from './people';

/**
 * The exam area (architecture Ş7). Readiness, the plan and weak spots are derived from the
 * student's mastery once an exam goal is chosen; with the school programme as the goal there
 * is no exam data. No official DİM date, duration or scoring rule is used.
 */

export const EXAM_SUBJECTS = [
  'math',
  'physics',
  'chemistry',
  'biology',
  'geography',
  'history',
  'azLanguage',
  'literature',
  'foreignLanguage',
] as const;
export const examSubjectSchema = z.enum(EXAM_SUBJECTS);

export const subjectReadinessSchema = z.discriminatedUnion('ready', [
  z.object({
    subject: examSubjectSchema,
    ready: z.literal(true),
    percent: z.number().int().min(0).max(100),
    weakCount: z.number().int().nonnegative(),
  }),
  z.object({ subject: examSubjectSchema, ready: z.literal(false) }),
]);

export const examStepTargetSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('review') }),
  z.object({ kind: z.literal('lesson'), id: z.string().min(1) }),
  z.object({ kind: z.literal('test'), id: z.string().min(1) }),
  z.object({ kind: z.literal('topic'), id: z.string().min(1) }),
]);

export const examStepReasonSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('chainRoot'), topic: z.string().min(1) }),
  z.object({
    kind: z.literal('mockErrors'),
    mocks: z.number().int().positive(),
    errors: z.number().int().positive(),
  }),
  z.object({
    kind: z.literal('questions'),
    count: z.number().int().positive(),
    range: z.string().min(1),
  }),
  z.object({ kind: z.literal('moved') }),
]);

export const examPlanStepSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(['review', 'lesson', 'test']),
  title: z.string().min(1),
  minutes: z.number().int().positive(),
  state: z.enum(['done', 'now', 'next']),
  /** Downloaded, so it opens without internet. */
  saved: z.boolean(),
  reason: examStepReasonSchema,
  target: examStepTargetSchema,
});

/** One day of the rolling week strip, relative to today. */
export const examPlanDaySchema = z.object({
  offset: z.number().int(),
  missed: z.boolean(),
  marks: z.array(z.enum(['done', 'plan', 'moved'])),
});

export const examPlanSchema = z.object({
  /** When the plan was last recalculated. */
  updatedAt: dateTimeSchema,
  days: z.array(examPlanDaySchema),
  today: z.array(examPlanStepSchema),
  /** Steps of a missed day spread over the coming days; null when nothing was missed. */
  moved: z.number().int().positive().nullable(),
});

/** One topic on the trail of a mistake, from the weak topic back to its root. */
export const chainLinkSchema = z.object({
  topicId: z.string().nullable(),
  topic: z.string().min(1),
  title: z.string().min(1),
  grade: z.number().int().min(1).max(11),
  state: masteryLevelSchema,
  errors: z.number().int().nonnegative(),
  root: z.boolean(),
  /** For a root without a textbook in the app: the topics that rebuild it ("1.4–1.5"). */
  rebuildWith: z.string().nullable(),
});

export const weakSpotSchema = z.object({
  id: z.string().min(1),
  topicId: z.string().min(1),
  topic: z.string().min(1),
  title: z.string().min(1),
  short: z.string().min(1),
  state: masteryLevelSchema,
  evidence: z.object({
    kind: z.enum(['recent', 'last', 'some']),
    mocks: z.number().int().nonnegative(),
    errors: z.number().int().nonnegative(),
  }),
  chain: z.array(chainLinkSchema).min(1),
  fixSteps: z.number().int().positive(),
  fixMinutes: z.number().int().positive(),
});

export const weakSpotsReportSchema = z.object({
  mocks: z.number().int().nonnegative(),
  errors: z.number().int().nonnegative(),
  /** Where most mistakes lead; null with no weak spots. */
  commonRoot: z.string().min(1).nullable(),
  spots: z.array(weakSpotSchema),
});
