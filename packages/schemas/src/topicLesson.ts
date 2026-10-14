import { z } from 'zod';

/**
 * A curriculum's lesson on one textbook topic (`.curricula/<cur>/lessons/<bookId>/<number>/
 * lesson.json`). The book's examples and exercises come from the topic's approved knowledge;
 * what is stored here is what AI writes for the lesson, kept apart until an editor approves it.
 */

/** `lesson_` and ten lower-case letters or digits; generated once, never reused. */
export const LESSON_ID = /^lesson_[a-z0-9]{10}$/;

/** One paragraph of the lesson text and the knowledge items it is written from. */
export const lessonParagraphSchema = z.object({
  /** Azerbaijani prose; mathematics as LaTeX between single dollar signs. */
  text: z.string().trim().min(1),
  /** Ids of the topic's approved knowledge items the paragraph says. */
  sources: z.array(z.string()).min(1),
});

export const lessonSectionSchema = z.object({
  heading: z.string().trim().min(1).nullable(),
  paragraphs: z.array(lessonParagraphSchema).min(1),
});

/** One written version of the lesson text: a draft until an editor approves it. */
export const lessonTextSchema = z.object({
  sections: z.array(lessonSectionSchema).min(1),
  /** Fingerprints of the items it was written from; a changed item means it may be stale. */
  itemFingerprints: z.record(z.string(), z.string()),
  model: z.string(),
  promptVersion: z.string(),
  costUsd: z.number(),
  createdAt: z.string(),
  approvedAt: z.string().nullable(),
});

export const topicLessonSchema = z.object({
  schemaVersion: z.literal(1),
  id: z.string().regex(LESSON_ID),
  topic: z.object({ bookId: z.string().min(1), number: z.string().min(1) }),
  /** The approved text students read; a new draft never replaces it until it is approved. */
  text: lessonTextSchema.nullable(),
  draft: lessonTextSchema.nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/** A lesson as the content index lists it under its curriculum. */
export const lessonEntrySchema = z.object({
  bookId: z.string(),
  number: z.string(),
  /** File under the content root, fetched as `/content/<path>`. */
  path: z.string(),
  text: z.boolean(),
  draft: z.boolean(),
  updatedAt: z.string(),
});

/** What writing a lesson text would cost, before it is written. */
export const lessonTextEstimateSchema = z.object({
  items: z.number().int().nonnegative(),
  inputTokens: z.number().int().nonnegative(),
  costUsd: z.number(),
  model: z.string(),
});
