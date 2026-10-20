import { z } from 'zod';
import { studyGoalSchema } from '../account';
import { optionKeySchema } from '../test';
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

export const mockGroupSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  short: z.string().min(1),
});

export const mockQuestionSchema = z.object({
  id: z.string().min(1),
  prompt: z.enum(['compute', 'simplify', 'expand', 'factor']),
  /** The expression, in plain Unicode maths. */
  expression: z.string().min(1),
  options: z.array(z.object({ key: optionKeySchema, text: z.string().min(1) })).length(5),
  correctKey: optionKeySchema,
  groupId: z.string().min(1),
  topicId: z.string().min(1),
  /** Textbook topic number the question practises ("4.1"). */
  topic: z.string().min(1),
  source: z.string().min(1),
});

export const mockExamSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(['scheduled', 'self']),
  subject: examSubjectSchema,
  number: z.number().int().positive(),
  durationMinutes: z.number().int().positive(),
  groups: z.array(mockGroupSchema),
  questions: z.array(mockQuestionSchema).min(1),
  /** Scheduled mocks only: when it starts and when registration closes. */
  startsAt: dateTimeSchema.nullable(),
  registrationEndsAt: dateTimeSchema.nullable(),
});

/** A finished attempt at a mock. */
export const mockRunSchema = z.object({
  id: z.string().min(1),
  mockId: z.string().min(1),
  finishedAt: dateTimeSchema,
  minutes: z.number().int().positive(),
  correct: z.number().int().nonnegative(),
  total: z.number().int().positive(),
  /** Option key per question id; missing = skipped. */
  answers: z.record(z.string(), optionKeySchema),
});

export const mockListItemSchema = z.discriminatedUnion('preparing', [
  z.object({
    preparing: z.literal(false),
    id: z.string().min(1),
    subject: examSubjectSchema,
    number: z.number().int().positive(),
    questionCount: z.number().int().positive(),
    status: z.enum(['new', 'done']),
    lastPercent: z.number().int().min(0).max(100).nullable(),
    lastDate: dateTimeSchema.nullable(),
  }),
  z.object({ preparing: z.literal(true), id: z.string().min(1), subject: examSubjectSchema }),
]);

export const leaderboardEntrySchema = z.object({
  rank: z.number().int().positive(),
  nick: z.string().min(1),
  score: z.number().int().min(0).max(100),
  minutes: z.number().int().positive(),
});

export const leaderboardSchema = z.object({
  scope: z.enum(['class', 'country']),
  mockId: z.string().min(1),
  participants: z.number().int().positive(),
  top: z.array(leaderboardEntrySchema),
  /** Rows just above the student's place. */
  around: z.array(leaderboardEntrySchema),
  you: leaderboardEntrySchema.extend({ topPercent: z.number().int().min(1).max(100) }),
});

export const deadlineSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('assignment'),
    id: z.string().min(1),
    date: dateTimeSchema,
    assignmentId: z.string().min(1),
    className: z.string().min(1),
    subject: examSubjectSchema,
    topic: z.string().min(1),
  }),
  z.object({
    kind: z.literal('registrationEnds'),
    id: z.string().min(1),
    date: dateTimeSchema,
    mockNumber: z.number().int().positive(),
  }),
  z.object({
    kind: z.literal('mock'),
    id: z.string().min(1),
    date: dateTimeSchema,
    mockNumber: z.number().int().positive(),
    subject: examSubjectSchema,
    registrationOpen: z.boolean(),
  }),
  z.object({ kind: z.literal('officialRegistration'), id: z.string().min(1), date: z.null() }),
  z.object({ kind: z.literal('officialExam'), id: z.string().min(1), date: z.null() }),
]);

/** GET /v1/exam: the goal and, for an exam goal, everything derived from mastery. */
export const examStateSchema = z.object({
  goal: studyGoalSchema,
  /** Demo counter until the server sends the DİM date; null for the school programme. */
  daysLeft: z.number().int().nonnegative().nullable(),
  readiness: z.array(subjectReadinessSchema),
  plan: examPlanSchema.nullable(),
  weakSpots: weakSpotsReportSchema.nullable(),
  mocks: z.array(mockListItemSchema),
  runs: z.array(mockRunSchema),
  deadlines: z.array(deadlineSchema),
});
