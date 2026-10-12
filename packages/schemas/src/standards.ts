import { z } from 'zod';

/**
 * Official standard sets the team enters in the admin panel (e.g. the ARTİ maths standards for
 * grade 7) and the links from a textbook's topics and knowledge items to their standards. Used
 * to monitor coverage only. Stored as files next to the pipeline outputs until the content
 * moves to the database.
 */

export const STANDARD_SET_TITLE_MAX = 160;
export const STANDARD_CODE_MAX = 32;
export const STANDARD_TEXT_MAX = 2000;

/** One standard (or sub-standard): its code as printed ("7-1.2.3") and its text. */
export const officialStandardSchema = z.object({
  code: z.string().trim().min(1).max(STANDARD_CODE_MAX),
  text: z.string().trim().min(1).max(STANDARD_TEXT_MAX),
  /** Content line (məzmun xətti) it belongs to, e.g. "Ədədlər və əməllər"; null when unknown. */
  line: z.string().trim().max(200).nullable(),
});

/** What the panel edits and saves. Codes are unique within a standard set. */
export const standardSetInputSchema = z
  .object({
    title: z.string().trim().min(1).max(STANDARD_SET_TITLE_MAX),
    subject: z.string().trim().max(80),
    grade: z.number().int().min(1).max(12).nullable(),
    standards: z.array(officialStandardSchema).max(2000),
  })
  .refine((c) => new Set(c.standards.map((s) => s.code)).size === c.standards.length, {
    message: 'Standard codes must be unique',
    path: ['standards'],
  });

export const standardSetSchema = z.object({
  id: z.string(),
  title: z.string(),
  subject: z.string(),
  grade: z.number().int().nullable(),
  standards: z.array(officialStandardSchema),
  updatedAt: z.string(),
});

/** A standard set as the content index lists it. */
export const standardSetEntrySchema = z.object({
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

const standardLinksObject = z.object({
  standardSetId: z.string().nullable(),
  /** Topic number ("6.1") → standard codes. */
  topics: z.record(z.string(), z.array(z.string())),
  items: z.array(itemStandardLinkSchema),
  updatedAt: z.string(),
});

/**
 * One book's links to one standard set; `standard-links.json` beside the book's book.json.
 * Files saved before the rename name the set `curriculumId`; they are read as they are.
 */
export const standardLinksSchema = z.preprocess(
  (value) =>
    value && typeof value === 'object' && !('standardSetId' in value) && 'curriculumId' in value
      ? { ...value, standardSetId: (value as { curriculumId: unknown }).curriculumId }
      : value,
  standardLinksObject,
);

/** What the panel sends to save a book's links (the server stamps `updatedAt`). */
export const standardLinksInputSchema = standardLinksObject.omit({ updatedAt: true });

/** Response of the panel's "create standard set" action. */
export const createStandardSetResponseSchema = z.object({ id: z.string() });

/** Response of the panel's "delete standard set" action. */
export const deleteStandardSetResponseSchema = z.object({ id: z.string() });

/** Response of the "save" actions: when the file was written. */
export const savedResponseSchema = z.object({ updatedAt: z.string() });

/** Response of the "delete for good" action on a deleted book. */
export const purgeTrashResponseSchema = z.object({ trashId: z.string() });
