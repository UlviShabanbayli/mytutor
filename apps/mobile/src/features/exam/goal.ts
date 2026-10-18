import type { StudyGoal } from '@mytutor/types';
import { daysUntilIso } from './calendar';

export type ExamGoal = Extract<StudyGoal, { kind: 'exam' }>;

/** The exam the student aims for, or null when they study the school programme or chose nothing. */
export function examGoalOf(goal: StudyGoal | null): ExamGoal | null {
  return goal?.kind === 'exam' ? goal : null;
}

/**
 * Days left until the exam. The official date comes from the server (DİM schedule); until it is
 * known, the demo counter is shown.
 */
export function examDaysLeft(goal: ExamGoal, today: Date, demoDays: number): number {
  return (goal.date ? daysUntilIso(goal.date, today) : null) ?? demoDays;
}

/** Whether a goal is complete enough to build a plan: admission needs its group. */
export function isGoalComplete(goal: ExamGoal): boolean {
  return goal.exam !== 'admission' || goal.group !== null;
}
