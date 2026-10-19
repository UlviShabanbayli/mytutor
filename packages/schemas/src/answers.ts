import { z } from 'zod';
import { aiCallSchema } from './knowledge';

/**
 * A textbook's answer key (its "CAVABLAR" pages). `textbook-parser answers` renders the pages
 * (`answers/source.json` + page images); `content-engine answers` reads them with Claude and
 * checks every answer against the page in a second, independent call (`answers/answers.json`).
 * Lessons show an exercise's answer from here: only the book's own answers, never AI solutions.
 */

/** One answer-key page, rendered, with its text layer as a reading aid. */
export const answerSourcePageSchema = z.object({
  page: z.number().int().positive(),
  printedPage: z.number().int().nullable(),
  /** Page image, relative to the `answers` folder. */
  image: z.string(),
  /** Text-layer lines in reading order per column; stacked fractions come apart here. */
  lines: z.array(z.object({ text: z.string(), x: z.number(), top: z.number() })),
});

export const answerSourceSchema = z.object({
  schemaVersion: z.literal(1),
  book: z.object({ file: z.string(), sha256: z.string() }),
  pages: z.array(answerSourcePageSchema).min(1),
});

/** One sub-item's answer as printed. */
export const answerPartSchema = z.object({
  label: z
    .string()
    .nullable()
    .describe('Sub-item letter as printed, without ")" (e.g. "d"); null when there is none'),
  text: z
    .string()
    .describe('The answer exactly as printed, Unicode mathematics (e.g. "2¼ litr", "−5/7")'),
  latex: z
    .string()
    .nullable()
    .describe('LaTeX of the answer when it has fractions, powers or symbols; else null'),
});

/** An answer as read from the page: which exercise it answers and what it says. */
export const extractedAnswerSchema = z.object({
  page: z
    .number()
    .int()
    .describe('The book page of the exercise: the number after the nearest "s." label above'),
  exercise: z.string().describe('Exercise number as printed, without the dot (e.g. "17")'),
  section: z
    .string()
    .nullable()
    .describe(
      'A heading the answer sits under other than a unit heading, e.g. "Riyazi kaleydoskop"',
    ),
  parts: z.array(answerPartSchema).min(1),
});

export const answerStatusSchema = z.enum(['verified', 'mismatch', 'unverified']);

export const answerSchema = extractedAnswerSchema.extend({
  id: z.string(),
  /** The answer-key page it is printed on. */
  sourcePage: z.number().int().positive(),
  sourcePrintedPage: z.number().int().nullable(),
  /** "verified": an independent read of the page agrees; "mismatch": it does not. */
  status: answerStatusSchema,
  /** What the checking read saw instead, when it disagreed. */
  correction: z.array(answerPartSchema).nullable(),
});

export const answersDocumentSchema = z.object({
  schemaVersion: z.literal(1),
  book: z.object({ file: z.string(), sha256: z.string() }),
  prompts: z.object({ extract: z.string(), verify: z.string() }),
  createdAt: z.string(),
  answers: z.array(answerSchema),
  aiCalls: z.array(aiCallSchema),
  summary: z.object({
    answers: z.number().int(),
    verified: z.number().int(),
    mismatch: z.number().int(),
    costUsd: z.number(),
  }),
});
