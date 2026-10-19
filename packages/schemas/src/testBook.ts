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

/** How the app names each subject, and its icon (an Ionicons name the app knows). */
export const SUBJECTS: Record<(typeof SUBJECT_IDS)[number], { title: string; icon: string }> = {
  riyaziyyat: { title: 'Riyaziyyat', icon: 'calculator' },
  'azerbaycan-dili': { title: 'Azərbaycan dili', icon: 'book' },
  edebiyyat: { title: 'Ədəbiyyat', icon: 'library' },
  'ingilis-dili': { title: 'İngilis dili', icon: 'language' },
  fizika: { title: 'Fizika', icon: 'magnet' },
  kimya: { title: 'Kimya', icon: 'flask' },
  biologiya: { title: 'Biologiya', icon: 'leaf' },
  tarix: { title: 'Tarix', icon: 'time' },
  cografiya: { title: 'Coğrafiya', icon: 'earth' },
  informatika: { title: 'İnformatika', icon: 'laptop' },
};

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
  /** `questions.json` once questions were split from the book, with counts. */
  questions: z
    .object({
      path: z.string(),
      total: z.number().int(),
      answered: z.number().int(),
      linked: z.number().int(),
      uncovered: z.number().int(),
      flagged: z.number().int(),
      pagesRead: z.number().int(),
    })
    .nullable()
    .default(null),
  /** `topics.json`: the textbook topics the questions may be keyed to. */
  topics: z.string().nullable().default(null),
});

export const addTestBookResponseSchema = z.object({ testBookId: z.string() });
export const deleteTestBookResponseSchema = z.object({ testBookId: z.string() });

/** A band of ink on a scanned page, in pixels of the page image; `id` names it ("L12"). */
export const testPageBandSchema = z.object({
  id: z.string().regex(/^[TLRBC]\d+$/),
  x0: z.number().int(),
  y0: z.number().int(),
  x1: z.number().int(),
  y1: z.number().int(),
});

/** One page of a test book as the parser sees it: its image, column rule and bands. */
export const testPageLayoutSchema = z.object({
  page: z.number().int().positive(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  /** The line between the two columns, when the page has one. */
  rule: z.object({ x: z.number().int(), y0: z.number().int(), y1: z.number().int() }).nullable(),
  bands: z.array(testPageBandSchema),
  /** The page image, and the same with band ids in the margins; relative to the book folder. */
  image: z.string(),
  marked: z.string(),
});

/** `pages.json` in a test book's folder: the pages rendered so far. */
export const testPagesSchema = z.object({
  schemaVersion: z.literal(1),
  testBookId: z.string().regex(TEST_BOOK_ID),
  pdfSha256: z.string(),
  pages: z.array(testPageLayoutSchema),
});
