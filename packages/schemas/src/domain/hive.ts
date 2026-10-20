import { z } from 'zod';
import {
  courseTopicSchema,
  courseUnitSchema,
  curriculumSubjectSchema,
  masteryLevelSchema,
  textbookChoiceSchema,
  textbookSchema,
  topicMaterialSchema,
  topicStepSchema,
} from './course';

/** What the learn area shows: the curriculum list and one subject's hive box with mastery. */

export const hiveTopicSchema = courseTopicSchema.extend({
  level: masteryLevelSchema,
  steps: z.array(topicStepSchema),
  material: topicMaterialSchema.optional(),
});

/** The unit test ("ana arı hüceyrəsi"): its level and, once taken, the result. */
export const unitTestSchema = z.object({
  level: masteryLevelSchema,
  result: z
    .object({
      correct: z.number().int().nonnegative(),
      total: z.number().int().positive(),
      points: z.number().int().nonnegative(),
      badge: z.string().optional(),
    })
    .optional(),
});

export const hiveUnitSchema = courseUnitSchema.omit({ topics: true }).extend({
  topics: z.array(hiveTopicSchema),
  unitTest: unitTestSchema,
});

/** A textbook in the hive's picker; only ready ones have topics. */
export const textbookSummarySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  parts: z.number().int().positive(),
  ready: z.boolean(),
  /** The volume that is ready, for "1-ci hissə hazırdır". */
  readyPart: z.number().int().positive().optional(),
  topicCount: z.number().int().nonnegative().optional(),
});

/** One subject and grade: the hive box ("pətək qutusu") of its textbook volume. */
export const hiveSchema = z.object({
  id: z.string().min(1),
  subjectId: z.string().min(1),
  subjectName: z.string().min(1),
  grade: z.number().int().min(1).max(11),
  textbookId: z.string().min(1),
  part: z.number().int().positive(),
  textbooks: z.array(textbookSummarySchema),
  units: z.array(hiveUnitSchema),
  /** The topic the student continues with ("Sən buradasan"); null before the first lesson. */
  currentTopicId: z.string().nullable(),
  /** Topics saved on the phone for offline use. */
  savedTopicIds: z.array(z.string()),
  /** Topics at mastered, reinforced or needs_practice, out of all topics. */
  filled: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
});

/** GET /v1/curriculum: every subject, its textbooks and the student's choice per subject. */
export const curriculumResponseSchema = z.object({
  subjects: z.array(curriculumSubjectSchema),
  textbooks: z.array(textbookSchema),
  choices: z.array(textbookChoiceSchema),
});

/** A short placement question written for the demo (never textbook or test-book text). */
export const placementQuestionSchema = z.object({
  id: z.string().min(1),
  unitId: z.string().min(1),
  topicId: z.string().min(1),
  prompt: z.string().min(1),
  options: z.array(z.string().min(1)).min(2),
  /** Index of the correct option. */
  answer: z.number().int().nonnegative(),
});
