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
});

export const answerOptionSchema = z.object({
  key: optionKeySchema,
  text: z.string().min(1),
});

export const questionSchema = z
  .object({
    id: z.string(),
    topicId: z.string(),
    stem: z.string().min(1),
    options: z.array(answerOptionSchema).min(2).max(OPTION_KEYS.length),
    correctKey: optionKeySchema,
    explanation: z.string().min(1),
    source: sourceRefSchema,
  })
  .refine((q) => q.options.some((o) => o.key === q.correctKey), {
    message: 'correctKey must match one of the options',
    path: ['correctKey'],
  });

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
  grade: z.number().int().min(1).max(11),
  questionCount: z.number().int().nonnegative(),
});

/** A test the student takes: a fixed list of questions for one topic. */
export const practiceTestSchema = z.object({
  id: z.string(),
  topicId: z.string(),
  subjectId: z.string(),
  title: z.string().min(1),
  questions: z.array(questionSchema).min(1),
});
