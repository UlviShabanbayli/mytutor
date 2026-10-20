import { z } from 'zod';

/**
 * The student-facing curriculum: subjects, the textbooks a subject can follow, their units and
 * topics, and each topic's mastery (architecture Ş3, ADR 0001). Topic titles and printed pages
 * are the textbook's table of contents; no other book text belongs here.
 */

/** A topic's mastery: the ADR 0001 statuses plus `reinforced` (design: the five hex cells). */
export const MASTERY_LEVELS = [
  'not_started',
  'lesson_completed',
  'mastered',
  'reinforced',
  'needs_practice',
] as const;
export const masteryLevelSchema = z.enum(MASTERY_LEVELS);

/**
 * Levels whose cell holds honey: mastered, reinforced (sealed) and needs_practice (honey that
 * crystallized and needs review). A cell with a finished lesson only is half nectar, not filled.
 */
export const FILLED_LEVELS = ['mastered', 'reinforced', 'needs_practice'] as const;

/** One student's mastery: topic id → level. A topic that is missing is `not_started`. */
export const masteryMapSchema = z.record(z.string(), masteryLevelSchema);

/** Printed page numbers (the numbers on the page, not the PDF's). */
export const pageRangeSchema = z
  .object({ start: z.number().int().positive(), end: z.number().int().positive() })
  .refine((r) => r.end >= r.start, { message: 'A page range ends after it starts' });

export const courseTopicSchema = z.object({
  /** "riyaziyyat-7-4-3". */
  id: z.string().min(1),
  /** "riyaziyyat-7-u4". */
  unitId: z.string().min(1),
  /** Number in the textbook, e.g. "4.3". */
  number: z.string().min(1),
  /** The title as the table of contents prints it. */
  title: z.string().min(1),
  /** The title up to its first full stop ("Cəmin və fərqin kubu"). */
  shortTitle: z.string().min(1),
  pages: pageRangeSchema,
  /** Ids of the topics this one builds on. */
  prerequisites: z.array(z.string()),
});

export const courseUnitSchema = z.object({
  id: z.string().min(1),
  /** "4". */
  number: z.string().min(1),
  title: z.string().min(1),
  pages: pageRangeSchema,
  topics: z.array(courseTopicSchema),
});

/** One volume of a textbook; only a ready volume opens in the app ("hazırlanır" otherwise). */
export const textbookVolumeSchema = z.object({
  part: z.number().int().positive(),
  ready: z.boolean(),
  units: z.array(courseUnitSchema),
});

/** A textbook edition a subject can follow (TRİMS in two parts, Radius in one). */
export const textbookSchema = z.object({
  id: z.string().min(1),
  subjectId: z.string().min(1),
  /** Publisher series shown in the picker, e.g. "TRİMS". */
  name: z.string().min(1),
  /** "Riyaziyyat 7 (TRİMS)": used in source lines. */
  title: z.string().min(1),
  parts: z.number().int().positive(),
  volumes: z.array(textbookVolumeSchema),
});

/** A subject and grade: a hive box when a textbook volume is ready, "hazırlanır" otherwise. */
export const curriculumSubjectSchema = z.object({
  /** "riyaziyyat-7". */
  id: z.string().min(1),
  name: z.string().min(1),
  grade: z.number().int().min(1).max(11),
  /** Two letters in the subject's hexagon. */
  monogram: z.string().min(1).max(2),
  textbookIds: z.array(z.string()),
});

/** The textbook and volume a student follows in a subject. */
export const textbookChoiceSchema = z.object({
  subjectId: z.string().min(1),
  textbookId: z.string().min(1),
  part: z.number().int().positive(),
});

/** One of the four steps inside a topic: lesson, worked examples, practice, topic test. */
export const TOPIC_STEP_KINDS = ['lesson', 'examples', 'practice', 'test'] as const;
export const topicStepSchema = z.object({
  kind: z.enum(TOPIC_STEP_KINDS),
  state: z.enum(['done', 'current', 'todo']),
  /** Examples and practice: how many there are and how many are done. */
  total: z.number().int().nonnegative().optional(),
  done: z.number().int().nonnegative().optional(),
  /** Estimated minutes for the whole step. */
  minutes: z.number().int().positive().optional(),
});

/** A teacher's own material attached to a topic for their class (shown with the name). */
export const topicMaterialSchema = z.object({
  id: z.string().min(1),
  teacher: z.string().min(1),
  /** The short form used in "Lalə müəllim". */
  teacherShort: z.string().min(1),
  className: z.string().min(1),
  title: z.string().min(1),
  /** "6:40". */
  duration: z.string().min(1),
  addedDaysAgo: z.number().int().nonnegative(),
});
