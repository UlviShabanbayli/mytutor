import { z } from 'zod';
import { gradeSchema, submissionStateSchema } from './assignments';
import { masteryLevelSchema } from './course';
import {
  childLinkStatusSchema,
  dateTimeSchema,
  parentProfileSchema,
  parentRelationSchema,
  personSchema,
  shareCategorySchema,
} from './people';

/**
 * What a parent sees (architecture V1–V3). Only the categories a child shares leave the
 * server: a report, progress, assignments or exam readiness that is not shared is null.
 */

export const topicRefSchema = z.object({
  topicId: z.string().min(1),
  number: z.string().min(1),
  title: z.string().min(1),
});

/** Seven days of one child; the latest report covers the last seven days, ending today. */
export const weekReportSchema = z.object({
  /** 00:00 of the report's first day. */
  weekStart: dateTimeSchema,
  minutes: z.number().int().nonnegative(),
  previousMinutes: z.number().int().nonnegative().nullable(),
  /** The seven days in order, oldest first. */
  activeDays: z.array(z.boolean()).length(7),
  answers: z.object({
    correct: z.number().int().nonnegative(),
    total: z.number().int().nonnegative(),
  }),
  newTopics: z.array(topicRefSchema),
  /** A unit whose every topic was filled this week. */
  completedUnit: z.string().nullable(),
  weakSpots: z.array(topicRefSchema),
  assignments: z
    .object({ onTime: z.number().int().nonnegative(), total: z.number().int().nonnegative() })
    .nullable(),
  /** Estimated readiness in percent; null when not shared or no exam goal exists. */
  examReadiness: z.number().int().min(0).max(100).nullable(),
  teacherNote: z
    .object({ teacherId: z.string().min(1), teacherName: z.string().min(1), text: z.string() })
    .nullable(),
});

/** One page of the report: a week by its offset from the latest week (0 = this week). */
export const reportPageSchema = z.object({
  report: weekReportSchema.nullable(),
  hasPrevious: z.boolean(),
  hasNext: z.boolean(),
});

/** This week at a glance on the child's card (only when the child shares the report). */
export const weekOverviewSchema = z.object({
  weekStart: dateTimeSchema,
  minutes: z.number().int().nonnegative(),
  activeDays: z.number().int().min(0).max(7),
  newTopics: z.number().int().nonnegative(),
  assignments: weekReportSchema.shape.assignments,
  lastActiveAt: dateTimeSchema.nullable(),
});

/** GET /v1/parent: a child as the parent's list shows it. */
export const childOverviewSchema = z.object({
  childId: z.string().min(1),
  name: z.string().min(1),
  grade: z.number().int().min(1).max(11),
  className: z.string().nullable(),
  teacherName: z.string().nullable(),
  relation: parentRelationSchema,
  status: childLinkStatusSchema,
  underThirteen: z.boolean(),
  grants: z.array(shareCategorySchema),
  week: weekOverviewSchema.nullable(),
});

export const unitProgressSchema = z.object({
  unitId: z.string().min(1),
  number: z.string().min(1),
  title: z.string().min(1),
  topics: z.array(
    z.object({ topicId: z.string().min(1), number: z.string().min(1), level: masteryLevelSchema }),
  ),
});

export const testScoreSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(['practice', 'unit']),
  /** Topic number for a practice test, unit number for a unit test. */
  ref: z.string().min(1),
  takenAt: dateTimeSchema,
  questions: z.number().int().positive(),
  correct: z.number().int().nonnegative(),
});

export const subjectProgressSchema = z.object({
  subjectId: z.string().min(1),
  title: z.string().min(1),
  book: z.string().min(1),
  units: z.array(unitProgressSchema),
  recentTests: z.array(testScoreSchema),
});

/** An assignment from the parent's side: the child's state and grade, nothing else. */
export const childAssignmentSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  dueAt: dateTimeSchema,
  state: submissionStateSchema,
  late: z.boolean(),
  lateDays: z.number().int().nonnegative(),
  progress: z
    .object({ done: z.number().int().nonnegative(), total: z.number().int().positive() })
    .nullable(),
  submittedAt: dateTimeSchema.nullable(),
  onTime: z.boolean(),
  /** A mock's grade is shown as a percent. */
  kind: z.enum(['lesson', 'test', 'homework', 'mock']),
  grade: gradeSchema.nullable(),
});

export const childAssignmentListSchema = z.object({
  classLabel: z.string().min(1),
  items: z.array(childAssignmentSchema),
});

/** A child under 13 whose account waits for the parent's SMS consent. */
export const consentRequestSchema = z.object({
  childId: z.string().min(1),
  childName: z.string().min(1),
  phoneMasked: z.string().min(1),
});

/** GET /v1/parent: the parent, the children and the consents waiting for them. */
export const parentHomeSchema = z.object({
  person: personSchema,
  profile: parentProfileSchema,
  children: z.array(childOverviewSchema),
  consentRequests: z.array(consentRequestSchema),
});

/** GET /v1/parent/codes/:code: whose code it is and whether it can still be used. */
export const parentCodeLookupSchema = z.object({
  code: z.string().min(1),
  childId: z.string().min(1),
  childName: z.string().min(1),
  grade: z.number().int().min(1).max(11),
  expired: z.boolean(),
  /** The parent already follows this child. */
  alreadyLinked: z.boolean(),
});
