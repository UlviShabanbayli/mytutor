import { z } from 'zod';

/** Kinds of non-topic blocks a textbook unit (bölmə) contains, in book order. */
export const textbookBlockKindSchema = z.enum([
  'pretest', // İlkin yoxlama
  'problems', // Məsələ və misallar
  'summary', // Xülasə
  'review', // Ümumiləşdirici tapşırıqlar
  'steam', // STEAM project page
  'glossary', // Sözlük
  'answers', // Cavablar
  'other',
]);

/** PDF page numbers are 1-based; `printedPage` is the number printed in the book. */
const pageRangeSchema = z.object({
  startPage: z.number().int().positive(),
  endPage: z.number().int().positive(),
});

export const textbookSectionSchema = z.object({
  title: z.string().min(1),
  page: z.number().int().positive(),
});

export const textbookTopicSchema = pageRangeSchema.extend({
  type: z.literal('topic'),
  /** "4.1" — unit index and topic index within the unit. */
  number: z.string().regex(/^\d+\.\d+$/),
  title: z.string().min(1),
  /** Sub-headings inside the topic, as printed (e.g. "Cəmin kvadratı"). */
  sections: z.array(textbookSectionSchema),
});

export const textbookBlockSchema = pageRangeSchema.extend({
  type: z.literal('block'),
  kind: textbookBlockKindSchema,
  title: z.string().min(1),
});

export const textbookUnitItemSchema = z.discriminatedUnion('type', [
  textbookTopicSchema,
  textbookBlockSchema,
]);

export const textbookUnitSchema = pageRangeSchema.extend({
  index: z.number().int().positive(),
  title: z.string().min(1),
  items: z.array(textbookUnitItemSchema),
});

export const textbookStructureSchema = z.object({
  source: z.object({
    file: z.string(),
    pageCount: z.number().int().positive(),
    /** pdfPage - printedPage, when page numbers could be read. */
    printedPageOffset: z.number().int().nullable(),
  }),
  units: z.array(textbookUnitSchema),
  backMatter: z.array(textbookBlockSchema),
  validation: z.object({
    /** Topic count per unit read from the table of contents ("1.1.", "1.2.", ...). */
    tocTopicCounts: z.record(z.string(), z.number().int()),
    detectedTopicCounts: z.record(z.string(), z.number().int()),
    warnings: z.array(z.string()),
  }),
});
