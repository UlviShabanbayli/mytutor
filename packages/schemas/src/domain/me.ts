import { z } from 'zod';
import { badgeSchema, rankSchema } from './league';
import { masteryLevelSchema } from './course';
import {
  childLinkStatusSchema,
  dateTimeSchema,
  demoPersonaSchema,
  parentRelationSchema,
  personSchema,
  studentProfileSchema,
} from './people';

/** The "Mən" area: the student's profile, progress per textbook, parents and plan. */

export const textbookProgressSchema = z.object({
  subjectId: z.string().min(1),
  title: z.string().min(1),
  /** "soon": the textbook is not processed yet (shown as "Hazırlanır"). */
  status: z.enum(['ready', 'soon']),
  topics: z.number().int().nonnegative(),
  units: z.number().int().nonnegative(),
  levels: z.record(masteryLevelSchema, z.number().int().nonnegative()),
});

/** A parent linked to the student, or asking to be. */
export const parentLinkViewSchema = z.object({
  parentId: z.string().min(1),
  name: z.string().min(1),
  relation: parentRelationSchema,
  status: childLinkStatusSchema,
  since: dateTimeSchema,
});

/** A plan feature row: what free and premium give. */
export const planFeatureSchema = z.object({
  id: z.enum(['lessons', 'review', 'askAi', 'askPhoto', 'examPlan', 'videos', 'offline']),
  free: z.enum(['yes', 'no', 'limited', 'basic', 'some']),
  premium: z.enum(['yes', 'unlimited', 'full', 'all']),
});

/** GET /v1/me. */
export const meResponseSchema = z.object({
  persona: demoPersonaSchema,
  person: personSchema,
  profile: studentProfileSchema,
  /** The next rank and the points it starts at; null at the top rank. */
  nextRank: rankSchema.nullable(),
  /** Topics at mastered, reinforced or needs_practice. */
  honeyCells: z.number().int().nonnegative(),
  badges: z.array(badgeSchema),
  textbooks: z.array(textbookProgressSchema),
  unreadInClasses: z.number().int().nonnegative(),
  parents: z.array(parentLinkViewSchema),
  /** The share of the class the student practised more than this week; null without a class. */
  classComparison: z.number().int().min(0).max(100).nullable(),
  planFeatures: z.array(planFeatureSchema),
});
