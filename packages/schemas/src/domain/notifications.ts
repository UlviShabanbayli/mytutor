import { z } from 'zod';
import { roleSchema } from '../account';
import { dateTimeSchema } from './people';

/** In-app notifications (architecture P1): every push also lands here, for one person and role. */

const base = {
  id: z.string().min(1),
  recipientId: z.string().min(1),
  role: roleSchema,
  at: dateTimeSchema,
  read: z.boolean(),
};

export const notificationSchema = z.discriminatedUnion('kind', [
  // Student
  z.object({
    ...base,
    kind: z.literal('answerReady'),
    questionId: z.string().min(1),
    teacherId: z.string().min(1),
  }),
  z.object({ ...base, kind: z.literal('newAssignment'), assignmentId: z.string().min(1) }),
  z.object({
    ...base,
    kind: z.literal('assignmentGraded'),
    assignmentId: z.string().min(1),
    teacherId: z.string().min(1),
    score: z.number().nonnegative(),
    outOf: z.number().positive(),
  }),
  z.object({
    ...base,
    kind: z.literal('reviewDue'),
    cells: z.number().int().positive(),
    minutes: z.number().int().positive(),
  }),
  z.object({ ...base, kind: z.literal('streak'), days: z.number().int().positive() }),
  z.object({
    ...base,
    kind: z.literal('weeklySummary'),
    topics: z.number().int().nonnegative(),
    accuracy: z.number().int().min(0).max(100),
  }),
  // Teacher
  z.object({
    ...base,
    kind: z.literal('question'),
    questionId: z.string().min(1),
    studentId: z.string().min(1),
  }),
  z.object({
    ...base,
    kind: z.literal('homework'),
    assignmentId: z.string().min(1),
    count: z.number().int().positive(),
  }),
  z.object({ ...base, kind: z.literal('verification') }),
  // Parent
  z.object({ ...base, kind: z.literal('weeklyReport'), childId: z.string().min(1) }),
  z.object({
    ...base,
    kind: z.literal('teacherMessage'),
    teacherId: z.string().min(1),
    threadId: z.string().min(1),
  }),
]);

/** What a parent can be told about; each can be switched off. */
export const PARENT_NOTIFICATION_KINDS = [
  'weeklyReport',
  'assignmentLate',
  'longBreak',
  'teacherMessage',
] as const;
export const notificationPrefsSchema = z.record(z.enum(PARENT_NOTIFICATION_KINDS), z.boolean());
