import { z } from 'zod';
import { askQuestionSchema } from './ask';
import { assignmentSchema, submissionSchema } from './assignments';
import { classMemberSchema, schoolClassSchema } from './classes';
import { masteryLevelSchema } from './course';
import { notificationSchema } from './notifications';
import { personSchema, teacherProfileSchema } from './people';

/** The teacher area (architecture M1–M8) and the question view both roles share. */

export const teacherClassViewSchema = schoolClassSchema.extend({
  studentCount: z.number().int().nonnegative(),
  activeThisWeek: z.number().int().nonnegative(),
  activeAssignments: z.number().int().nonnegative(),
  /** Share of assigned work done, 0–1. */
  completion: z.number().min(0).max(1),
  chatUnread: z.number().int().nonnegative(),
});

/** GET /v1/teacher. */
export const teacherHomeSchema = z.object({
  person: personSchema,
  profile: teacherProfileSchema,
  classes: z.array(teacherClassViewSchema),
  notices: z.array(notificationSchema),
});

export const rosterEntrySchema = classMemberSchema.extend({
  name: z.string().min(1),
  shortName: z.string().min(1),
});

/** An assignment with its class-wide progress. */
export const teacherAssignmentSchema = assignmentSchema.extend({
  done: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
  /** Homework handed in and waiting for the teacher. */
  toGrade: z.number().int().nonnegative(),
});

/** GET /v1/teacher/classes/:id. */
export const teacherClassDetailSchema = z.object({
  class: teacherClassViewSchema,
  members: z.array(rosterEntrySchema),
  assignments: z.array(teacherAssignmentSchema),
});

export const submissionViewSchema = submissionSchema.extend({
  studentName: z.string().min(1),
  source: z.string().min(1),
});

/** A question with the names both roles show. */
export const askQuestionViewSchema = askQuestionSchema.extend({
  studentName: z.string().min(1),
  /** "Lalə müəllim"; null for the general queue before someone takes it. */
  teacherName: z.string().nullable(),
  /** "Riyaziyyat 7". */
  subjectLabel: z.string().min(1),
  topic: z
    .object({
      id: z.string().min(1),
      number: z.string().min(1),
      title: z.string().min(1),
      lessonId: z.string().min(1),
      lessonMinutes: z.number().int().positive(),
    })
    .nullable(),
});

/** A question of our bank: included in a test as it is, never edited (M3). */
export const bankQuestionSchema = z.object({
  id: z.string().min(1),
  topicId: z.string().min(1),
  text: z.string().min(1),
  source: z.string().min(1),
});

/** GET /v1/teacher/insights/:classId: only students who allowed it are shown by name. */
export const classInsightsSchema = z.object({
  classId: z.string().min(1),
  unitId: z.string().min(1),
  days: z.number().int().positive(),
  topics: z.array(z.object({ id: z.string().min(1), number: z.string().min(1) })),
  completion: z.number().min(0).max(1),
  activeThisWeek: z.number().int().nonnegative(),
  studentCount: z.number().int().nonnegative(),
  rows: z.array(
    z.object({
      studentId: z.string().min(1),
      name: z.string().min(1),
      levels: z.array(masteryLevelSchema),
    }),
  ),
  hiddenCount: z.number().int().nonnegative(),
  missed: z.array(
    z.object({
      id: z.string().min(1),
      text: z.string().min(1),
      source: z.string().min(1),
      wrong: z.number().int().nonnegative(),
      total: z.number().int().positive(),
    }),
  ),
});
