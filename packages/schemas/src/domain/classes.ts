import { z } from 'zod';
import { dateTimeSchema } from './people';

/** Classes, their rosters, announcements and the materials teachers share (architecture M2–M3). */

export const classGroupSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  memberIds: z.array(z.string()),
});

export const schoolClassSchema = z.object({
  id: z.string().min(1),
  /** "7B": shown inside the class hexagon. */
  shortName: z.string().min(1),
  /** "7B · Riyaziyyat". */
  name: z.string().min(1),
  subjectId: z.string().min(1),
  subject: z.string().min(1),
  grade: z.number().int().min(1).max(11),
  teacherId: z.string().min(1),
  /** The code a teacher shares so students can join ("7B-MATH-4K2"). */
  joinCode: z.string().min(1),
  paid: z.boolean(),
  groups: z.array(classGroupSchema),
  chatOpen: z.boolean(),
});

/** One student of a class roster. */
export const classMemberSchema = z.object({
  classId: z.string().min(1),
  personId: z.string().min(1),
  /** The student allowed the teacher to see their overall progress. */
  sharesProgress: z.boolean(),
  mutedInChat: z.boolean(),
  /** Studied at least once this week. */
  activeThisWeek: z.boolean(),
  /** Points this week, for the class league. */
  weekPoints: z.number().int().nonnegative(),
  joinedAt: dateTimeSchema,
});

export const announcementSchema = z.object({
  id: z.string().min(1),
  classId: z.string().min(1),
  authorId: z.string().min(1),
  text: z.string().min(1),
  at: dateTimeSchema,
});

/**
 * Something a teacher made or shared. `size` is in KB for a file, questions for a test or a
 * question, blocks for a lesson and seconds for a video.
 */
export const MATERIAL_KINDS = ['file', 'lesson', 'video', 'test', 'question'] as const;
export const materialKindSchema = z.enum(MATERIAL_KINDS);

/** `class`: published to the teacher's own classes; catalogue items go through review. */
export const MATERIAL_STATES = ['draft', 'class', 'in_review', 'approved'] as const;
export const materialStateSchema = z.enum(MATERIAL_STATES);

export const materialSchema = z.object({
  id: z.string().min(1),
  ownerId: z.string().min(1),
  kind: materialKindSchema,
  title: z.string().min(1),
  /** The platform topic the material is bound to, when it has one. */
  topicId: z.string().min(1).nullable(),
  classIds: z.array(z.string()),
  size: z.number().int().nonnegative(),
  views: z.number().int().nonnegative().optional(),
  state: materialStateSchema,
  updatedAt: dateTimeSchema,
});

/** A recorded live lesson students can watch again. */
export const recordingSchema = z.object({
  id: z.string().min(1),
  classId: z.string().min(1),
  topicId: z.string().min(1),
  title: z.string().min(1),
  recordedAt: dateTimeSchema,
  minutes: z.number().int().positive(),
});
