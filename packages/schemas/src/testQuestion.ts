import { z } from 'zod';
import { aiCallSchema } from './knowledge';
import { subjectIdSchema, TEST_BOOK_ID } from './testBook';

/**
 * Questions split from a test book (`.test-books/<id>/questions.json`): what Claude read on
 * each page, assembled by code into whole questions with their answers from the book's key
 * and their links to textbook topics. Everything here is a suggestion until an editor confirms.
 */

/** `q_` and ten lower-case letters or digits; generated once per question, never reused. */
export const QUESTION_ID = /^q_[a-z0-9]{10}$/;

export const testQuestionTypeSchema = z.enum(['choice', 'open', 'matching', 'written']);

const keyedTextSchema = z.object({ key: z.string(), text: z.string() });

/** What Claude reads on one page; ids name the bands in the page's margins. */
export const pageReadingSchema = z.object({
  kind: z.enum(['questions', 'answers', 'contents', 'other']),
  printedPage: z.number().int().describe('The page number printed on the page; 0 when none'),
  headings: z
    .array(
      z.object({
        level: z.enum(['section', 'subsection', 'group']),
        text: z.string(),
      }),
    )
    .describe('Every heading on the page in reading order'),
  situations: z.array(
    z.object({
      title: z.string().describe('As printed, e.g. "Situasiya № 18"'),
      text: z.string().describe('The shared text, without its questions; maths in $…$'),
      bands: z.array(z.string()),
      figureBands: z.array(z.string()),
    }),
  ),
  questions: z.array(
    z.object({
      number: z.number().int().describe('As printed; 0 when the page starts inside a question'),
      subsection: z
        .string()
        .describe('The subsection heading above it on this page; "" when none is above it'),
      written: z.boolean().describe('Under «Ətraflı yazılı cavab tələb olunan tapşırıqlar»'),
      situation: z.string().describe('"Situasiya № N" when it belongs to one, else ""'),
      type: testQuestionTypeSchema,
      stem: z.string().describe('The text without its number, options or items; maths in $…$'),
      options: z.array(keyedTextSchema).describe('A–E for a choice question, else []'),
      left: z.array(keyedTextSchema).describe('Numbered items of a matching question, else []'),
      right: z.array(keyedTextSchema).describe('Lettered items of a matching question, else []'),
      bands: z.array(z.string()).describe('Every band the question occupies on this page'),
      figureBands: z.array(z.string()).describe('Bands holding a drawing, chart, table or photo'),
      continues: z.enum(['no', 'from_previous_page', 'to_next_page', 'both']),
      unclear: z.string().describe('What could not be read with certainty, or ""'),
    }),
  ),
  answerTables: z
    .array(
      z.object({
        section: z.string().describe('The heading above the tables on this page; "" when none'),
        subsection: z.string().describe('The title right above the table'),
        answers: z.array(
          z.object({
            number: z.number().int(),
            answer: z.string().describe('The cell exactly as printed'),
          }),
        ),
      }),
    )
    .describe('Tables of correct answers, on answer pages only'),
});

/** A question's answer from the book's key, as printed and as understood for its type. */
export const testAnswerSchema = z.object({
  printed: z.string(),
  /** The option for a choice question. */
  choice: z.enum(['A', 'B', 'C', 'D', 'E']).nullable(),
  /** Numbered item → lettered items, for a matching question. */
  pairs: z.record(z.string(), z.array(z.string())).nullable(),
  /** Where the key prints it: the PDF page, and the number printed on that page. */
  page: z.number().int(),
  printedPage: z.number().int().nullable().default(null),
});

/** A link from a question to a textbook topic it draws on (see docs/decisions/0001). */
export const questionTopicLinkSchema = z.object({
  bookId: z.string(),
  number: z.string(),
  /** `required`: the question cannot be solved without the topic; `related`: context only. */
  role: z.enum(['required', 'related']),
  status: z.enum(['suggested', 'confirmed', 'rejected']),
  confidence: z.number().min(0).max(1).nullable(),
  reason: z.string(),
});

export const testQuestionSchema = z.object({
  id: z.string().regex(QUESTION_ID),
  number: z.number().int(),
  section: z.string(),
  subsection: z.string(),
  written: z.boolean(),
  situation: z
    .object({ title: z.string(), text: z.string(), figures: z.array(z.string()) })
    .nullable(),
  type: testQuestionTypeSchema,
  stem: z.string(),
  options: z.array(keyedTextSchema),
  matching: z
    .object({ left: z.array(keyedTextSchema), right: z.array(keyedTextSchema) })
    .nullable(),
  answer: testAnswerSchema.nullable(),
  /** Pages the question is printed on, with the bands it takes on each. */
  pages: z.array(
    z.object({
      page: z.number().int(),
      printedPage: z.number().int().nullable(),
      bands: z.array(z.string()),
    }),
  ),
  /** Cut-outs of the printed question and of its figures; relative to the book folder. */
  crops: z.array(z.string()),
  figures: z.array(z.string()),
  /** Problems found reading or assembling it; an editor looks at these first. */
  flags: z.array(z.string()),
  links: z.array(questionTopicLinkSchema),
  /** What the question needs that no textbook topic of ours covers; null when covered. */
  uncovered: z.string().nullable(),
});

export const testQuestionsDocumentSchema = z.object({
  schemaVersion: z.literal(1),
  testBookId: z.string().regex(TEST_BOOK_ID),
  prompts: z.object({ read: z.string(), keys: z.string().nullable() }),
  /** Pages read so far. */
  pages: z.array(z.number().int()),
  questions: z.array(testQuestionSchema),
  /** Answers in the key that no question was found for (yet). */
  unmatchedAnswers: z.array(
    z.object({
      section: z.string(),
      subsection: z.string(),
      number: z.number().int(),
      printed: z.string(),
      page: z.number().int(),
    }),
  ),
  aiCalls: z.array(aiCallSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/**
 * `topics.json` in a test book's folder: the textbook topics its questions may be keyed to,
 * with short codes ("B1/1.4": book 1, topic 1.4) Claude names them by.
 */
export const topicCatalogueSchema = z.object({
  schemaVersion: z.literal(1),
  subject: subjectIdSchema,
  books: z.array(
    z.object({
      code: z.string(),
      bookId: z.string(),
      title: z.string(),
      grade: z.number().int().nullable(),
    }),
  ),
  topics: z.array(
    z.object({
      code: z.string(),
      bookId: z.string(),
      number: z.string(),
      grade: z.number().int().nullable(),
      unit: z.string(),
      title: z.string(),
      /** "approved": `teaches` is the topic's approved knowledge; "none": its opening lines. */
      knowledge: z.enum(['approved', 'none']),
      teaches: z.array(z.string()),
    }),
  ),
});
