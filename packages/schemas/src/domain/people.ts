import { z } from 'zod';
import { roleSchema, studyGoalSchema } from '../account';

/**
 * People and their profiles (architecture "Rollar və icazələr"). One person may hold several
 * roles; each role has its own profile. Short forms of a name ("Aysel Q.") are derived from the
 * full name, never stored apart from it.
 */

/** A moment as an ISO 8601 UTC string ("2026-10-20T09:12:00.000Z"). */
export const dateTimeSchema = z.iso.datetime();

/** The demo worlds the app can show: Nərmin's, or a first-day student's. */
export const DEMO_PERSONAS = ['nermin', 'fresh'] as const;
export const demoPersonaSchema = z.enum(DEMO_PERSONAS);

export const personSchema = z.object({
  id: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1).nullable(),
  /** "Nərmin Əliyeva". */
  fullName: z.string().min(1),
  /** "Nərmin Ə.": first name and the surname's initial. */
  shortName: z.string().min(1),
  /** "NƏ": one or two letters for an avatar. */
  initials: z.string().min(1).max(2),
  roles: z.array(roleSchema).min(1),
});

export const STUDENT_PLANS = ['free', 'premium'] as const;
export const studentPlanSchema = z.enum(STUDENT_PLANS);

/** Ranks in order (design: Sürfə → Gənc arı → İşçi arı → Bal ustası → Pətək ustası). */
export const RANK_IDS = ['larva', 'young', 'worker', 'honeyMaster', 'hiveMaster'] as const;
export const rankIdSchema = z.enum(RANK_IDS);

/** Weekly leagues in order (design: Yonca → Lalə → Qızılgül → Nərgiz → Xarıbülbül). */
export const LEAGUE_IDS = ['clover', 'tulip', 'rose', 'narcissus', 'kharibulbul'] as const;
export const leagueIdSchema = z.enum(LEAGUE_IDS);

export const pointsSchema = z.object({
  total: z.number().int().nonnegative(),
  week: z.number().int().nonnegative(),
  today: z.number().int().nonnegative(),
});

export const studentProfileSchema = z.object({
  personId: z.string().min(1),
  /** The name the app greets with; null for a student who has not given one. */
  name: z.string().min(1).nullable(),
  grade: z.number().int().min(1).max(11),
  /** Shown instead of the name in leagues and leaderboards. */
  nickname: z.string().min(1),
  plan: studentPlanSchema,
  points: pointsSchema,
  /** Days in a row with the daily goal met. */
  streak: z.number().int().nonnegative(),
  /** Streak shields ("qalxan") that keep the streak through a missed day. */
  shields: z.number().int().nonnegative(),
  rank: rankIdSchema,
  league: z.object({ id: leagueIdSchema, place: z.number().int().positive() }),
  goal: studyGoalSchema,
  dailyMinutes: z.number().int().positive(),
  classIds: z.array(z.string()),
  /** The subject (curriculum) the student follows now, e.g. "riyaziyyat-7". */
  subjectId: z.string().min(1),
});

/** M1: unverified teachers open free classes; verified ones unlock paid classes and more. */
export const TEACHER_VERIFICATIONS = ['unverified', 'pending', 'verified'] as const;
export const teacherVerificationSchema = z.enum(TEACHER_VERIFICATIONS);

/** M8: the marketplace profile; visible to students only after verification. */
export const tutorListingSchema = z.object({
  /** Price per hour in manat; null until the teacher sets it. */
  pricePerHour: z.number().nonnegative().nullable(),
  subjects: z.array(z.string()),
  gradeFrom: z.number().int().min(1).max(11),
  gradeTo: z.number().int().min(1).max(11),
  exams: z.array(z.literal('graduation_9')),
  /** Weekdays, Monday = 0. */
  days: z.array(z.number().int().min(0).max(6)),
  hours: z.string(),
  bio: z.string(),
  reviewCount: z.number().int().nonnegative(),
  /** Income this month in manat; null while there are no paid classes. */
  monthIncome: z.number().nonnegative().nullable(),
});

export const teacherProfileSchema = z.object({
  personId: z.string().min(1),
  subject: z.string().min(1),
  grade: z.number().int().min(1).max(11),
  verification: teacherVerificationSchema,
  /** When the documents were sent (pending verification). */
  submittedAt: dateTimeSchema.nullable(),
  classIds: z.array(z.string()),
  listing: tutorListingSchema,
});

export const parentProfileSchema = z.object({
  personId: z.string().min(1),
  /** "+994 50 *** ** 04": enough to recognise the number, nothing more. */
  phoneMasked: z.string().min(1),
});

/** What a child can choose to show a parent. */
export const SHARE_CATEGORIES = ['report', 'progress', 'assignments', 'exam'] as const;
export const shareCategorySchema = z.enum(SHARE_CATEGORIES);

export const PARENT_RELATIONS = ['mother', 'father', 'guardian'] as const;
export const parentRelationSchema = z.enum(PARENT_RELATIONS);

/**
 * A parent's link to a child. `awaiting_consent`: a child under 13 is opening an account and
 * needs the parent's SMS consent; `requested`: the parent typed the child's code and waits for
 * the child's approval.
 */
export const CHILD_LINK_STATUSES = ['active', 'awaiting_consent', 'requested'] as const;
export const childLinkStatusSchema = z.enum(CHILD_LINK_STATUSES);

export const childLinkSchema = z.object({
  parentId: z.string().min(1),
  childId: z.string().min(1),
  relation: parentRelationSchema,
  status: childLinkStatusSchema,
  underThirteen: z.boolean(),
  /** The categories the child shares; the server leaves out everything else. */
  grants: z.array(shareCategorySchema),
  /** When the link became active (or was asked for). */
  since: dateTimeSchema,
});

/** A code that opens something: a class to join, or a parent's link to a child. */
export const linkCodeSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('class'),
    code: z.string().min(1),
    classId: z.string().min(1),
  }),
  z.object({
    kind: z.literal('parent'),
    code: z.string().regex(/^[A-Z0-9]{6}$/),
    childId: z.string().min(1),
    expiresAt: dateTimeSchema,
  }),
]);

/** A fake phone that signs in to one demo role (demo mode only; real accounts replace them). */
export const demoAccountSchema = z.object({
  /** E.164, e.g. "+994500000001". */
  phone: z.string().regex(/^\+994\d{9}$/),
  role: roleSchema,
  persona: demoPersonaSchema,
  personId: z.string().min(1),
  label: z.string().min(1),
});
