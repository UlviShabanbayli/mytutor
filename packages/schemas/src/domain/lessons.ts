import { z } from 'zod';
import { practiceTestSchema, questionSchema } from '../test';

/**
 * Lessons and tests of the study area (architecture Ş4–Ş5). Demo lessons are our own short
 * maths; every `source` line names the textbook's topic and says "demo".
 */

/** The whiteboard video of a lesson. */
export const lessonVideoSchema = z.object({
  /** HLS or MP4 address; null while the video is still being prepared. */
  source: z.string().nullable(),
  title: z.string().min(1),
  minutes: z.number().int().positive(),
  /** "Bu dərsdə": what the video covers, in two sentences. */
  summary: z.string().min(1),
  /** What the poster board shows: a heading and the key formula. */
  board: z.object({ heading: z.string().min(1), formula: z.string().min(1) }),
});

/** One page of the lesson text: paragraphs, the rule box, a closing line and a warning note. */
export const lessonPageSchema = z.object({
  heading: z.string().min(1),
  paragraphs: z.array(z.string().min(1)).min(1),
  rule: z.array(z.string().min(1)).nullable(),
  after: z.string().nullable(),
  note: z.string().nullable(),
  /** A ready question for Vızı ("niyə məhz 3?"), or null. */
  askVizi: z.string().nullable(),
});

export const workedStepSchema = z.object({ title: z.string().min(1), body: z.string().min(1) });

/** A solved example, revealed one step at a time. */
export const workedExampleSchema = z.object({
  number: z.number().int().positive(),
  problem: z.string().min(1),
  steps: z.array(workedStepSchema).min(1),
  hint: z.string().min(1),
  source: z.string().min(1),
});

/** An exercise whose typed answer is checked against the answer. */
export const lessonExerciseSchema = z.object({
  number: z.number().int().positive(),
  prompt: z.string().min(1),
  expression: z.string().min(1),
  answer: z.string().min(1),
  /** Letters the formula keys offer next to ², ³, the signs and the brackets. */
  variables: z.array(z.string().min(1)),
  source: z.string().min(1),
});

/** GET /v1/lessons/:id: a topic's lesson; its id is the topic id. */
export const studyLessonSchema = z.object({
  id: z.string().min(1),
  /** Topic number in the textbook, e.g. "4.3". */
  topicCode: z.string().min(1),
  topicTitle: z.string().min(1),
  source: z.string().min(1),
  video: lessonVideoSchema,
  pages: z.array(lessonPageSchema).min(1),
  example: workedExampleSchema,
  exercise: lessonExerciseSchema,
  /** Points ("bal damcısı") for finishing the lesson. */
  points: z.number().int().nonnegative(),
  /** The topic test the lesson leads to ("test-<topicId>"). */
  testId: z.string().min(1),
});

/** Match each formula on the left with its partner on the right. */
export const matchStepSchema = z.object({
  kind: z.literal('match'),
  id: z.string().min(1),
  prompt: z.string().min(1),
  left: z.array(z.string().min(1)).min(2),
  right: z.array(z.string().min(1)).min(2),
  /** For each left item, the index of its partner on the right. */
  pairs: z.array(z.number().int().nonnegative()),
  source: z.string().min(1),
});

/** A written solution sent as photos; the AI looks first, then the teacher checks it. */
export const writtenStepSchema = z.object({
  kind: z.literal('written'),
  id: z.string().min(1),
  prompt: z.string().min(1),
  source: z.string().min(1),
  reviewer: z.string().min(1),
});

export const questionStepSchema = z.object({
  kind: z.literal('question'),
  id: z.string().min(1),
  question: questionSchema,
});

/** One screen of a test session. */
export const sessionStepSchema = z.discriminatedUnion('kind', [
  questionStepSchema,
  matchStepSchema,
  writtenStepSchema,
]);

export const STUDY_TEST_KINDS = ['topic', 'unit', 'review', 'mistakes', 'demo'] as const;

/** GET /v1/tests/:id: "test-<topicId>" for a topic, "test-<unitId>" for a unit. */
export const studyTestSchema = z.object({
  test: practiceTestSchema,
  steps: z.array(sessionStepSchema).min(1),
  kind: z.enum(STUDY_TEST_KINDS),
  /** Topic or unit number shown with the test ("Mövzu testi · 4.3"). */
  topicCode: z.string().nullable(),
  /** Points for finishing the test. */
  points: z.number().int().nonnegative(),
});
