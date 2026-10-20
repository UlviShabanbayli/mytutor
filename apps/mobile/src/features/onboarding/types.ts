import type { AdmissionGroup, ExamKind, SubjectId } from '@mytutor/types';

/**
 * View types of first launch for the demo. What reaches the server later is the
 * `OnboardingProfile` (packages/schemas); these only shape the screens.
 */

/** The goal screen's four answers; "graduation" and "admission" continue to the exam screen. */
export type GoalChoice = 'school' | 'graduation' | 'admission' | 'unsure';

/** One exam chip: a school-leaving exam, or the admission exam with its subject group. */
export type ExamOption = { exam: ExamKind; group: AdmissionGroup | null };

/** Screens that show the step progress at the top, and the track each belongs to. */
export type StepKey =
  | 'lang'
  | 'role'
  | 'grade'
  | 'goal'
  | 'exam'
  | 'time'
  | 'ready'
  | 'phone'
  | 'otp'
  | 'age'
  | 'consent'
  | 'teacher'
  | 'parent';

export type StepTrack = 'start' | 'account' | 'teacher' | 'parent';

/** A teacher's first answers (architecture M1); sent to the teacher profile API once it exists. */
export type TeacherDraft = { subjects: SubjectId[]; grades: number[]; bio: string };

/** The child a parent's code points to (architecture V1). */
export type LinkedChild = { name: string; grade: number };

/** What a typed child code opens: whose it is, and whether it can still link. */
export type ChildCodeLookup = LinkedChild & {
  childId: string;
  expired: boolean;
  /** This parent already follows the child. */
  alreadyLinked: boolean;
};

/** One line of the "Hazırdır!" summary. */
export type SummaryRow = {
  /** Short text in the hexagon: "7", "M", "20". */
  key: string;
  label: string;
  value: string;
  editLabel: string;
  onEdit: () => void;
};
