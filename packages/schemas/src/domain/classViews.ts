import { z } from 'zod';
import { assignmentSchema, submissionSchema } from './assignments';
import { announcementSchema, materialSchema, recordingSchema } from './classes';
import { liveLessonSchema } from './live';
import { dateTimeSchema } from './people';

/** Classes as a student sees them (architecture Ş10): the list, a class's feed, assignments. */

export const personRefSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  initials: z.string().min(1),
});

export const classSummarySchema = z.object({
  id: z.string().min(1),
  shortName: z.string().min(1),
  name: z.string().min(1),
  teacher: personRefSchema,
  students: z.number().int().nonnegative(),
  unread: z.number().int().nonnegative(),
  newMessages: z.number().int().nonnegative(),
  newAnnouncements: z.number().int().nonnegative(),
  nextAssignment: z.object({ id: z.string(), title: z.string(), dueAt: dateTimeSchema }).nullable(),
  nextLive: z.object({ id: z.string(), title: z.string(), startsAt: dateTimeSchema }).nullable(),
  /** The class's shared honey jar this week: done of goal, and the student's own part. */
  jar: z.object({
    percent: z.number().int().min(0).max(100),
    done: z.number().int().nonnegative(),
    goal: z.number().int().positive(),
    mine: z.number().int().nonnegative(),
  }),
});

/** An assignment with the student's own state. */
export const studentAssignmentSchema = assignmentSchema.extend({
  className: z.string().min(1),
  teacher: personRefSchema,
  topic: z.object({
    id: z.string().min(1),
    number: z.string().min(1),
    title: z.string().min(1),
    source: z.string().min(1),
  }),
  submission: submissionSchema.nullable(),
  late: z.boolean(),
});

/** GET /v1/classes/:id. */
export const classFeedSchema = z.object({
  class: classSummarySchema,
  announcements: z.array(announcementSchema),
  live: liveLessonSchema.nullable(),
  recording: recordingSchema.nullable(),
  assignments: z.array(studentAssignmentSchema),
  materials: z.array(materialSchema),
});

/** GET /v1/classes/join/:code: what joining would open. */
export const classPreviewSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  teacher: personRefSchema,
  students: z.number().int().nonnegative(),
  /** The student is in the class already. */
  member: z.boolean(),
});
