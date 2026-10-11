import { z } from 'zod';

/**
 * Source layer: what the textbook says, where. Produced deterministically from the PDF
 * (no AI) and referenced by every later layer (knowledge, lessons, questions).
 *
 * Coordinates are PDF points with a TOP-LEFT origin (y grows downwards), so a region
 * maps directly onto the rendered page image: pixel = point × image scale.
 */

export const bboxSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number().nonnegative(),
  height: z.number().nonnegative(),
});

/** A rectangle on one page; the unit of traceability for every extracted element. */
export const sourceRegionSchema = z.object({
  page: z.number().int().positive(),
  printedPage: z.number().int().nullable(),
  bbox: bboxSchema,
});

export const sourcePageSchema = z.object({
  page: z.number().int().positive(),
  printedPage: z.number().int().nullable(),
  width: z.number().positive(),
  height: z.number().positive(),
  /** Rendered page image, relative to the topic output folder. */
  image: z.string(),
  imageScale: z.number().positive(),
  imageSha256: z.string(),
});

export const sourceLineSchema = z.object({
  id: z.string(),
  /** Text layer after glyph repair. Formulas are often incomplete here: use the image. */
  text: z.string(),
  region: sourceRegionSchema,
  /** Contains formula glyphs (math font, superscripts, operators). */
  math: z.boolean(),
  /** "low" when glyph repair left suspicious characters. */
  quality: z.enum(['ok', 'low']),
});

export const sourceFigureSchema = z.object({
  id: z.string(),
  kind: z.enum(['image', 'vector']),
  region: sourceRegionSchema,
  /** Text drawn inside the figure (axis labels, "a", "b", …). */
  labels: z.array(z.string()),
  image: z.string(),
});

export const sourceBlockKindSchema = z.enum([
  'title', // topic heading
  'inquiry', // Araşdırma-müzakirə
  'section', // Öyrənmə + sub-heading and its explanation
  'think', // Fikirləş!
  'remember', // Yadda saxla!
  'find_mistake', // Səhvi düzəlt!
  'history', // Riyaziyyat tarixindən
  'exercises', // Çalışma (container)
  'problems', // Məsələ həlli (container)
  'exercise', // numbered task inside exercises/problems
  'example', // NÜMUNƏ (inside a section, exercise or remember box)
  'theorem', // Teorem N.
  'callout', // a template badge the parser does not know: needs review
]);

export const sourceBlockSchema = z.object({
  id: z.string(),
  kind: sourceBlockKindSchema,
  /** Label as printed in the book ("Araşdırma-müzakirə", "NÜMUNƏ 1"). */
  label: z.string().nullable(),
  /** Heading text for sections and examples, when the book has one. */
  title: z.string().nullable(),
  /** Exercise or example number as printed. */
  number: z.string().nullable(),
  parentId: z.string().nullable(),
  /** One region per page the block covers, in reading order. */
  regions: z.array(sourceRegionSchema).min(1),
  /** Cropped images of the regions, relative to the topic output folder. */
  crops: z.array(z.string()),
  lineIds: z.array(z.string()),
  figureIds: z.array(z.string()),
  flags: z.object({ hasMath: z.boolean(), hasFigure: z.boolean(), lowTextQuality: z.boolean() }),
});

export const topicSourceSchema = z.object({
  schemaVersion: z.literal(1),
  parserVersion: z.string(),
  book: z.object({
    file: z.string(),
    sha256: z.string(),
    pageCount: z.number().int().positive(),
    printedPageOffset: z.number().int().nullable(),
  }),
  topic: z.object({
    number: z.string(),
    title: z.string(),
    unit: z.object({ index: z.number().int().positive(), title: z.string() }),
    start: z.object({ page: z.number().int().positive(), y: z.number() }),
    end: z.object({ page: z.number().int().positive(), y: z.number() }),
  }),
  pages: z.array(sourcePageSchema),
  blocks: z.array(sourceBlockSchema),
  lines: z.array(sourceLineSchema),
  figures: z.array(sourceFigureSchema),
  warnings: z.array(z.string()),
});
