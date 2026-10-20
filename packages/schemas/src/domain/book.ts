import { z } from 'zod';
import { answerSchema } from '../answers';
import { pageRangeSchema } from './course';

/**
 * Book-derived content the local API serves from the content folder (never committed, never in
 * the Worker): a topic's approved lesson text and the book's own answers on its pages. Without
 * the folder these routes are 404 and the app shows its demo lesson.
 */

/** GET /v1/lessons/:topicId/book: the approved lesson text of a topic. */
export const bookLessonSchema = z.object({
  topicId: z.string().min(1),
  number: z.string().min(1),
  /** "Riyaziyyat 7 (TRİMS), 1-ci hissə". */
  book: z.string().min(1),
  sections: z
    .array(
      z.object({
        heading: z.string().min(1).nullable(),
        /** Azerbaijani prose; mathematics as LaTeX between single dollar signs. */
        paragraphs: z.array(z.string().min(1)).min(1),
      }),
    )
    .min(1),
  approvedAt: z.string().min(1),
});

/** GET /v1/lessons/:topicId/answers: the book's answers to the exercises on the topic's pages. */
export const bookAnswersSchema = z.object({
  topicId: z.string().min(1),
  number: z.string().min(1),
  book: z.string().min(1),
  pages: pageRangeSchema,
  answers: z.array(answerSchema),
});
