import { z } from 'zod';
import { mathSvgSchema } from '../test';
import { masteryLevelSchema } from './course';
import { dateTimeSchema } from './people';

/** Spaced review and "Səhvlərim" (architecture Ş6), both derived from the mastery map. */

export const reviewCellSchema = z.object({
  topicId: z.string().min(1),
  code: z.string().min(1),
  title: z.string().min(1),
});

/** GET /v1/review: today's spaced review. */
export const reviewPlanSchema = z.object({
  due: z.array(reviewCellSchema),
  questionCount: z.number().int().nonnegative(),
  minutes: z.number().int().nonnegative(),
  /** One topic's schedule, to explain how review works. */
  example: reviewCellSchema.extend({
    masteredDaysAgo: z.number().int().nonnegative(),
    intervals: z.array(z.number().int().positive()),
    done: z.number().int().nonnegative(),
  }),
  upcoming: z.array(z.object({ inDays: z.number().int().positive(), cells: z.array(z.string()) })),
  /** The practice that starts today's review ("test-review"); null with nothing due. */
  testId: z.string().min(1).nullable(),
});

export const mistakeItemSchema = z.object({
  id: z.string().min(1),
  /** Question text; formulas between $…$ come from the group's `math`. */
  stem: z.string().min(1),
  yours: z.string().min(1),
  right: z.string().min(1),
  source: z.string().min(1),
  explanation: z.string().nullable(),
  subjectId: z.string().min(1),
  finishedAt: dateTimeSchema,
});

/** GET /v1/mistakes: one group per topic. */
export const mistakeGroupSchema = z.object({
  id: z.string().min(1),
  topicId: z.string().min(1),
  title: z.string().min(1),
  cell: masteryLevelSchema,
  items: z.array(mistakeItemSchema).min(1),
  math: z.record(z.string(), mathSvgSchema),
});
