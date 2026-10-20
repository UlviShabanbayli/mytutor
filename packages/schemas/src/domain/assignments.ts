import { z } from 'zod';
import { dateTimeSchema } from './people';

/**
 * Class assignments and the students' submissions (architecture M4, Ş10). One assignment is the
 * same everywhere: the teacher's list, the student's class feed, the parent's list and Today.
 */

export const ASSIGNMENT_KINDS = ['lesson', 'test', 'homework', 'mock'] as const;
export const assignmentKindSchema = z.enum(ASSIGNMENT_KINDS);

export const audienceSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('class') }),
  z.object({ type: z.literal('group'), groupId: z.string().min(1) }),
  z.object({ type: z.literal('students'), ids: z.array(z.string().min(1)).min(1) }),
]);

export const assignmentSchema = z.object({
  id: z.string().min(1),
  classId: z.string().min(1),
  kind: assignmentKindSchema,
  topicId: z.string().min(1),
  /** The unit of a unit test ("ana arı hüceyrəsi"). */
  unitId: z.string().min(1).optional(),
  title: z.string().min(1),
  description: z.string(),
  /** Exercises of a homework, questions of a test or mock. */
  itemCount: z.number().int().positive().optional(),
  /** Where "Başla" leads for a test or mock ("test-<topicId>" or "test-<unitId>"). */
  testId: z.string().min(1).optional(),
  attachment: z.object({ name: z.string().min(1), sizeKb: z.number().int().positive() }).optional(),
  audience: audienceSchema,
  assignedAt: dateTimeSchema,
  dueAt: dateTimeSchema,
});

/** Where one student is with one assignment. Late is derived: due passed, not submitted. */
export const SUBMISSION_STATES = ['not_started', 'in_progress', 'submitted', 'checked'] as const;
export const submissionStateSchema = z.enum(SUBMISSION_STATES);

export const gradeSchema = z.object({
  score: z.number().nonnegative(),
  max: z.number().positive(),
});

export const submissionSchema = z.object({
  id: z.string().min(1),
  assignmentId: z.string().min(1),
  studentId: z.string().min(1),
  state: submissionStateSchema,
  progress: z
    .object({ done: z.number().int().nonnegative(), total: z.number().int().positive() })
    .nullable(),
  submittedAt: dateTimeSchema.nullable(),
  /** Photos of a written homework. */
  photos: z.number().int().nonnegative(),
  /** The handwritten pages as lines (a photo in the real app). */
  pages: z.array(z.array(z.string())),
  /** The AI's first look at a written homework: the right exercises and a suggested grade. */
  ai: z
    .object({
      correct: z.array(z.number().int().positive()),
      note: z.string(),
      suggested: gradeSchema,
    })
    .nullable(),
  grade: gradeSchema.nullable(),
  /** The teacher's comment once graded (or the draft while grading). */
  comment: z.string(),
  gradedAt: dateTimeSchema.nullable(),
});
