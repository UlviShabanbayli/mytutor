import { z } from 'zod';

/**
 * Curricula the team enters in the admin panel (e.g. the ARTİ maths curriculum for grade 7) and
 * the links from a textbook's topics and knowledge items to their standards. Stored as files
 * next to the pipeline outputs until the content moves to the database.
 */

export const CURRICULUM_TITLE_MAX = 160;
export const STANDARD_CODE_MAX = 32;
export const STANDARD_TEXT_MAX = 2000;

/** One standard (or sub-standard): its code as printed ("7-1.2.3") and its text. */
export const curriculumStandardSchema = z.object({
  code: z.string().trim().min(1).max(STANDARD_CODE_MAX),
  text: z.string().trim().min(1).max(STANDARD_TEXT_MAX),
  /** Content line (məzmun xətti) it belongs to, e.g. "Ədədlər və əməllər"; null when unknown. */
  line: z.string().trim().max(200).nullable(),
});

/** What the panel edits and saves. Codes are unique within a curriculum. */
export const curriculumInputSchema = z
  .object({
    title: z.string().trim().min(1).max(CURRICULUM_TITLE_MAX),
    subject: z.string().trim().max(80),
    grade: z.number().int().min(1).max(12).nullable(),
    standards: z.array(curriculumStandardSchema).max(2000),
  })
  .refine((c) => new Set(c.standards.map((s) => s.code)).size === c.standards.length, {
    message: 'Standard codes must be unique',
    path: ['standards'],
  });

export const curriculumSchema = z.object({
  id: z.string(),
  title: z.string(),
  subject: z.string(),
  grade: z.number().int().nullable(),
  standards: z.array(curriculumStandardSchema),
  updatedAt: z.string(),
});

/** A curriculum as the content index lists it. */
export const curriculumEntrySchema = z.object({
  id: z.string(),
  title: z.string(),
  subject: z.string(),
  grade: z.number().int().nullable(),
  standardCount: z.number().int().nonnegative(),
  /** File under the content root, fetched as `/content/<path>`. */
  path: z.string(),
  updatedAt: z.string(),
});

/**
 * A knowledge item's standards. Item ids are numbered per document, so a re-extracted document
 * can renumber them: the fingerprint of the item's content finds it again, and a link whose item
 * is gone is shown for review instead of moving to another item.
 */
export const itemStandardLinkSchema = z.object({
  topic: z.string(),
  itemId: z.string(),
  fingerprint: z.string(),
  codes: z.array(z.string()).min(1),
});

/** One book's links to one curriculum; `curriculum-links.json` beside the book's book.json. */
export const curriculumLinksSchema = z.object({
  curriculumId: z.string().nullable(),
  /** Topic number ("6.1") → standard codes. */
  topics: z.record(z.string(), z.array(z.string())),
  items: z.array(itemStandardLinkSchema),
  updatedAt: z.string(),
});

/** What the panel sends to save a book's links (the server stamps `updatedAt`). */
export const curriculumLinksInputSchema = curriculumLinksSchema.omit({ updatedAt: true });

/** Response of the panel's "create curriculum" action. */
export const createCurriculumResponseSchema = z.object({ id: z.string() });

/** Response of the panel's "delete curriculum" action. */
export const deleteCurriculumResponseSchema = z.object({ id: z.string() });

/** Response of the "save" actions: when the file was written. */
export const savedResponseSchema = z.object({ updatedAt: z.string() });

/** Response of the "delete for good" action on a deleted book. */
export const purgeTrashResponseSchema = z.object({ trashId: z.string() });
