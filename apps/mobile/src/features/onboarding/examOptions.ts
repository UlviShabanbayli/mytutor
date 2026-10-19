import { ADMISSION_GROUPS } from '@mytutor/schemas';
import type { StudyGoal } from '@mytutor/types';
import type { ExamOption, GoalChoice } from './types';

/** The exam chips in the design's order: both school-leaving exams, then groups I–V. */
export const EXAM_OPTIONS: readonly ExamOption[] = [
  { exam: 'graduation_9', group: null },
  { exam: 'graduation_11', group: null },
  ...ADMISSION_GROUPS.map((group): ExamOption => ({ exam: 'admission', group })),
];

/** A stable key per chip: "graduation_9", "graduation_11", "admission_III". */
export function examOptionKey(option: ExamOption): string {
  return option.group === null ? option.exam : `${option.exam}_${option.group}`;
}

export function sameExamOption(a: ExamOption, b: ExamOption): boolean {
  return a.exam === b.exam && a.group === b.group;
}

/**
 * The chip selected when the exam screen opens: the exam already chosen, else the one the goal
 * points to (grade 10–11 aim for the grade-11 exam, younger students for grade 9).
 */
export function initialExamOption(
  goal: StudyGoal | null,
  choice: GoalChoice | null,
  grade: number | null,
): ExamOption {
  if (goal?.kind === 'exam') {
    const group = goal.exam === 'admission' ? (goal.group ?? 'I') : null;
    return { exam: goal.exam, group };
  }
  if (choice === 'admission') return { exam: 'admission', group: 'I' };
  return { exam: grade !== null && grade >= 10 ? 'graduation_11' : 'graduation_9', group: null };
}

/** The profile's goal for a chip (the date stays unknown until the exam calendar exists). */
export function examGoal(option: ExamOption): StudyGoal {
  return { kind: 'exam', exam: option.exam, group: option.group, date: null };
}

/** Which goal answer a stored goal comes from, when the screen opens again. */
export function goalChoiceOf(goal: StudyGoal | null, stored: GoalChoice | null): GoalChoice {
  if (stored !== null) return stored;
  if (goal === null) return 'school';
  if (goal.kind === 'school') return 'school';
  return goal.exam === 'admission' ? 'admission' : 'graduation';
}
