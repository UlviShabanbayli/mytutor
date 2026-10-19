import { z } from 'zod';

/**
 * Who uses the app (architecture: "Rollar və icazələr"). One account may hold several roles;
 * the app shows one active role at a time.
 */
export const ROLES = ['student', 'teacher', 'parent'] as const;
export const roleSchema = z.enum(ROLES);

/** The DİM exams a student can aim for: school-leaving after grade 9 or 11, or admission. */
export const EXAM_KINDS = ['graduation_9', 'graduation_11', 'admission'] as const;
export const examKindSchema = z.enum(EXAM_KINDS);

/** Admission exam subject groups (I–V). */
export const ADMISSION_GROUPS = ['I', 'II', 'III', 'IV', 'V'] as const;
export const admissionGroupSchema = z.enum(ADMISSION_GROUPS);

/** What the student studies for: the school programme, or an exam on a date. */
export const studyGoalSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('school') }),
  z.object({
    kind: z.literal('exam'),
    exam: examKindSchema,
    group: admissionGroupSchema.nullable().default(null),
    /** ISO date (YYYY-MM-DD) when known. */
    date: z.string().nullable().default(null),
  }),
]);

/** Daily goal in minutes (design: 10 light, 20 normal, 30 serious). */
export const DAILY_MINUTES = [10, 20, 30] as const;
export const dailyMinutesSchema = z.union([z.literal(10), z.literal(20), z.literal(30)]);

/** What first launch collects on the device before any account exists. */
export const onboardingProfileSchema = z.object({
  /** School grade 5–11, only to recommend; every grade stays open. */
  grade: z.number().int().min(1).max(11).nullable().default(null),
  goal: studyGoalSchema.nullable().default(null),
  dailyMinutes: dailyMinutesSchema.nullable().default(null),
});
