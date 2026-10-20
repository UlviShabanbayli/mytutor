import { z } from 'zod';

/** DİM-style tests use five answer options. */
export const OPTION_KEYS = ['A', 'B', 'C', 'D', 'E'] as const;
export const optionKeySchema = z.enum(OPTION_KEYS);

/**
 * Where a question comes from. Every question must cite its source
 * (a textbook or a test bank) so teachers can verify it.
 */
export const sourceRefSchema = z.object({
  kind: z.enum(['textbook', 'test_bank']),
  title: z.string().min(1),
  grade: z.number().int().min(1).max(11).optional(),
  section: z.string().optional(),
  page: z.number().int().positive().optional(),
  /** Our own demo item that only points at the book's topic; none of the book's text. */
  demo: z.boolean().optional(),
});

export const answerOptionSchema = z.object({
  key: optionKeySchema,
  text: z.string().min(1),
});

/**
 * How a question is answered: "choice" picks one of the options, "open" types a number. Older
 * questions have no type: they are choice questions.
 */
export const questionTypeSchema = z.enum(['choice', 'open']);

/**
 * One formula of a test, typeset as SVG (ink in `currentColor`); sizes are in em of the text
 * around it, `depth` how far it reaches below the baseline.
 */
export const mathSvgSchema = z.object({
  svg: z.string(),
  width: z.number(),
  height: z.number(),
  depth: z.number(),
});

export const questionSchema = z
  .object({
    id: z.string(),
    topicId: z.string(),
    type: questionTypeSchema.default('choice'),
    /** The question; formulas between single dollar signs, typeset from the test's `math`. */
    stem: z.string().min(1),
    options: z.array(answerOptionSchema).max(OPTION_KEYS.length).default([]),
    /** The right option of a choice question. */
    correctKey: optionKeySchema.nullable().default(null),
    /** The answer of an open question: a number as printed ("36", "2,8"). */
    answer: z.string().nullable().default(null),
    /** Only what the source itself explains; null when it gives no explanation. */
    explanation: z.string().nullable().default(null),
    /** Pictures the question needs, as paths the API serves. */
    figures: z.array(z.string()).default([]),
    source: sourceRefSchema,
  })
  .refine(
    (q) =>
      q.type === 'choice'
        ? q.options.length >= 2 && q.options.some((o) => o.key === q.correctKey)
        : q.answer !== null && q.answer.trim() !== '',
    {
      message: 'A choice question needs its correct option; an open question its answer',
      path: ['correctKey'],
    },
  );

export const subjectSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  /** Icon name from the app's icon set; the app falls back to a generic icon. */
  icon: z.string(),
  topicCount: z.number().int().nonnegative(),
  questionCount: z.number().int().nonnegative(),
});

export const topicSchema = z.object({
  id: z.string(),
  subjectId: z.string(),
  title: z.string().min(1),
  /** Null for a topic that is not one grade's, such as a test book's section. */
  grade: z.number().int().min(1).max(11).nullable(),
  questionCount: z.number().int().nonnegative(),
});

/** A test the student takes: a fixed list of questions for one topic. */
export const practiceTestSchema = z.object({
  id: z.string(),
  topicId: z.string(),
  subjectId: z.string(),
  title: z.string().min(1),
  questions: z.array(questionSchema).min(1),
  /** Every formula in the test's questions, by its LaTeX. */
  math: z.record(z.string(), mathSvgSchema).default({}),
});

/**
 * One subject's tests as published for the app (`.published/tests/<subject>.json`): what the
 * API serves. Built from editors' content, never written by hand.
 */
export const publishedTestsSchema = z.object({
  schemaVersion: z.literal(1),
  subject: subjectSchema,
  topics: z.array(topicSchema),
  tests: z.array(practiceTestSchema),
  publishedAt: z.string(),
});
