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
  topics: z.array(contentTopicEntrySchema),
});

export const contentIndexSchema = z.object({
  books: z.array(contentBookEntrySchema),
});

/** Optional `book.json` written by hand next to a book's outputs. */
export const bookMetaSchema = z.object({
  title: z.string().min(1),
});
