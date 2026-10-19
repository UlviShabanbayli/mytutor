import { z } from 'zod';
import { lessonEntrySchema } from './topicLesson';

/**
 * A curriculum is the course a team builds for one subject and grade ("Riyaziyyat — 7-ci
 * sinif"): it starts empty and gathers textbooks, then topics, lessons and scenarios. It is not
 * an official standard set (see `./standards`), and needs none to work.
 */

export const CURRICULUM_TITLE_MAX = 160;

/** `cur_` and ten lower-case letters or digits; generated once, never reused. */
export const CURRICULUM_ID = /^cur_[a-z0-9]{10}$/;

export const curriculumIdSchema = z.string().regex(CURRICULUM_ID);

/** A textbook the curriculum draws on; the book itself stays in the shared library. */
export const curriculumTextbookSchema = z.object({
  bookId: z.string().min(1),
  addedAt: z.string(),
});

/** What the panel edits: the curriculum's name, subject and grade. */
export const curriculumInputSchema = z.object({
  title: z.string().trim().min(1).max(CURRICULUM_TITLE_MAX),
  subject: z.string().trim().max(80),
  grade: z.number().int().min(1).max(12).nullable(),
});

/** `.curricula/<id>/curriculum.json`. */
export const curriculumSchema = z.object({
  schemaVersion: z.literal(1),
  id: curriculumIdSchema,
  title: z.string(),
  subject: z.string(),
  grade: z.number().int().nullable(),
  textbooks: z.array(curriculumTextbookSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/** A curriculum as the content index lists it. */
export const curriculumEntrySchema = z.object({
  id: curriculumIdSchema,
  title: z.string(),
  subject: z.string(),
  grade: z.number().int().nullable(),
  textbooks: z.array(curriculumTextbookSchema),
  /** Its lessons that have something written (`.curricula/<id>/lessons/`). */
  lessons: z.array(lessonEntrySchema).default([]),
  /** File under the content root, fetched as `/content/<path>`. */
  path: z.string(),
  updatedAt: z.string(),
});

/** Body of the "add a textbook to the curriculum" action. */
export const curriculumTextbookInputSchema = z.object({ bookId: z.string().min(1) });

/** Response of the panel's "create curriculum" action. */
export const createCurriculumResponseSchema = z.object({ id: curriculumIdSchema });
