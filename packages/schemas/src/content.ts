import { z } from 'zod';

/**
 * Index of pipeline outputs available to the admin panel: which books were split and which
 * topics have a source layer / knowledge document. Paths are relative to the content root
 * (the folder the parser and content engine write to) and are fetched as `/content/<path>`.
 */

export const contentTopicEntrySchema = z.object({
  number: z.string(),
  /** `topics/<n>/` folder: page images, crops and figures resolve relative to it. */
  dir: z.string(),
  source: z.string().nullable(),
  knowledge: z.string().nullable(),
});

export const contentBookEntrySchema = z.object({
  /** PDF file name without extension; stable across parser output folders. */
  id: z.string(),
  file: z.string(),
  /** From an optional `book.json` next to the outputs; null falls back to the file name. */
  title: z.string().nullable(),
  structure: z.string().nullable(),
  /** The PDF is on disk, so topics can be extracted from the panel. */
  canExtract: z.boolean(),
  topics: z.array(contentTopicEntrySchema),
});

export const contentIndexSchema = z.object({
  books: z.array(contentBookEntrySchema),
});

/** `book.json` next to a book's outputs: written by the panel on upload, or by hand. */
export const bookMetaSchema = z.object({
  title: z.string().min(1),
  /** The textbook PDF, relative to the book folder or absolute. Never served to the browser. */
  pdf: z.string().min(1).optional(),
});

export const BOOK_TITLE_MAX = 120;

/** Why a panel action was refused; the panel maps each code to a message. */
export const contentActionErrorCodeSchema = z.enum([
  'exists',
  'not_pdf',
  'bad_name',
  'bad_title',
  'bad_topic',
  'too_large',
  'not_textbook',
  'split_failed',
  'source_failed',
  'busy',
  'no_pdf',
  'no_topic',
  'no_book',
  'forbidden',
  'method',
  'not_found',
  'network',
  'internal',
]);

/** Response of the panel's "add book" action. */
export const addBookResponseSchema = z.object({ bookId: z.string() });

/** Response of the panel's "extract topic source" action. */
export const extractSourceResponseSchema = z.object({ bookId: z.string(), topic: z.string() });
