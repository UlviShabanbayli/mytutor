import type { StudyGoal } from '@mytutor/types';

export type ExamGoal = Extract<StudyGoal, { kind: 'exam' }>;

/** The exam the student aims for, or null when they study the school programme or chose nothing. */
export function examGoalOf(goal: StudyGoal | null): ExamGoal | null {
  return goal?.kind === 'exam' ? goal : null;
}

/** Whether a goal is complete enough to build a plan: admission needs its group. */
export function isGoalComplete(goal: ExamGoal): boolean {
  return goal.exam !== 'admission' || goal.group !== null;
}
