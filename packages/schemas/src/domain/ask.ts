import { z } from 'zod';
import { dateTimeSchema } from './people';

/**
 * A student's photo question (architecture Ş8, M6): sent → the AI's first pass → a teacher
 * checks it → answered. The student's Ask and the teacher's inbox show the same question.
 */

/** Where a question is now; `queued` lives on the device only, before it is sent. */
export const ASK_STATUSES = ['queued', 'sent', 'teacher_checking', 'answered'] as const;
export const askStatusSchema = z.enum(ASK_STATUSES);

/** Who answers: the student's own class teacher, or the shared queue of verified teachers. */
export const ASK_QUEUES = ['teacher', 'general'] as const;
export const askQueueSchema = z.enum(ASK_QUEUES);

/** What happened to the question, in order. */
export const ASK_EVENTS = ['sent', 'ai_solved', 'teacher_opened', 'answered'] as const;
export const askEventSchema = z.object({ event: z.enum(ASK_EVENTS), at: dateTimeSchema });

export const solutionStepSchema = z.object({
  id: z.string().min(1),
  /** What the step does, in the student's language. */
  text: z.string().min(1),
  /** The maths of the step, e.g. "(a + b)³ = a³ + 3a²b + 3ab² + b³". */
  formula: z.string().min(1),
  /** The teacher changed the AI's step. */
  edited: z.boolean().optional(),
});

export const similarQuestionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  source: z.string().min(1),
  topicId: z.string().min(1),
});

export const askQuestionSchema = z.object({
  id: z.string().min(1),
  studentId: z.string().min(1),
  /** The class whose teacher answers; null for the general queue. */
  classId: z.string().nullable(),
  queue: askQueueSchema,
  /** The teacher who answers (or answered). */
  teacherId: z.string().nullable(),
  subjectId: z.string().min(1),
  topicId: z.string().nullable(),
  /** Short description of the question (written by the AI or the teacher). */
  title: z.string().min(1),
  /** The maths the student wrote, drawn on the paper thumbnail when there is no photo. */
  mark: z.string().min(1),
  photoUri: z.string().nullable(),
  /** What the student wrote next to the photo. */
  note: z.string(),
  status: askStatusSchema,
  timeline: z.array(askEventSchema).min(1),
  /** The AI's first pass: shown marked as AI until a teacher approves it. */
  aiDraft: z
    .object({
      status: z.enum(['solving', 'ready']),
      answer: z.string().nullable(),
      steps: z.array(solutionStepSchema),
    })
    .nullable(),
  answer: z
    .object({
      teacherId: z.string().min(1),
      steps: z.array(solutionStepSchema).min(1),
      /** What the teacher changed, if anything. */
      teacherNote: z.string().nullable(),
      correctedAi: z.boolean(),
    })
    .nullable(),
  /** Source line; null until the question is linked to a topic. */
  source: z.string().nullable(),
  similar: z.array(similarQuestionSchema),
});

/** Today's free-plan allowance (the server counts it by plan; P4). */
export const askUsageSchema = z.object({
  photoUsed: z.number().int().nonnegative(),
  photoLimit: z.number().int().positive(),
  chatUsed: z.number().int().nonnegative(),
  chatLimit: z.number().int().positive(),
});
