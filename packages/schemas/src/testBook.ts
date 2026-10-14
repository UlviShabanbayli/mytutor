import { z } from 'zod';

/**
 * A book of tests only (`.test-books/<id>/test-book.json`, the PDF beside it). Questions are
 * split from test books, never from textbooks; textbooks give the topics questions are keyed to.
 */

/** `tb_` and ten lower-case letters or digits; generated once, never reused. */
export const TEST_BOOK_ID = /^tb_[a-z0-9]{10}$/;

/** The subjects a test book can be for: the DİM exam subjects, as ids. */
export const SUBJECT_IDS = [
  'riyaziyyat',
  'azerbaycan-dili',
  'edebiyyat',
  'ingilis-dili',
  'fizika',
  'kimya',
  'biologiya',
  'tarix',
  'cografiya',
  'informatika',
] as const;
export const subjectIdSchema = z.enum(SUBJECT_IDS);

export const testBookSchema = z.object({
  schemaVersion: z.literal(1),
  id: z.string().regex(TEST_BOOK_ID),
  title: z.string().trim().min(1),
  subject: subjectIdSchema,
  /** The uploaded PDF in the book's folder. Never served to the browser. */
  pdf: z.object({
    file: z.string().min(1),
    bytes: z.number().int().positive(),
    sha256: z.string().regex(/^[0-9a-f]{64}$/),
    pages: z.number().int().positive(),
  }),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/** A test book as the content index lists it; newest first. */
export const testBookEntrySchema = z.object({
  id: z.string(),
  title: z.string(),
  subject: subjectIdSchema,
  /** The PDF's file name in the book's folder. */
  file: z.string(),
  pages: z.number().int().positive(),
  bytes: z.number().int().positive(),
  createdAt: z.string(),
});

export const addTestBookResponseSchema = z.object({ testBookId: z.string() });
export const deleteTestBookResponseSchema = z.object({ testBookId: z.string() });
