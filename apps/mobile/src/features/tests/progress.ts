import type { TestResult } from '@mytutor/types';

const dayKey = (date: Date) => date.toDateString();

/** Days in a row, up to today (or yesterday, if today has nothing yet), with a finished test. */
export function streakDays(results: TestResult[], now = new Date()): number {
  const days = new Set(results.map((r) => dayKey(new Date(r.finishedAt))));
  const day = new Date(now);
  if (!days.has(dayKey(day))) day.setDate(day.getDate() - 1);
  let streak = 0;
  while (days.has(dayKey(day))) {
    streak++;
    day.setDate(day.getDate() - 1);
  }
  return streak;
}

/** Whether each day of the current week (Monday first) has a finished test. */
export function weekActivity(results: TestResult[], now = new Date()): boolean[] {
  const days = new Set(results.map((r) => dayKey(new Date(r.finishedAt))));
  const monday = new Date(now);
  // getDay(): Sunday 0 … Saturday 6; weeks start on Monday in Azerbaijan.
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    return days.has(dayKey(day));
  });
}

/** Index (0 = Monday) of today within the week. */
export const todayIndex = (now = new Date()) => (now.getDay() + 6) % 7;

/** Questions answered and answered correctly, over all finished tests. */
export function answerTotals(results: TestResult[]): { answered: number; correct: number } {
  return results.reduce(
    (sum, r) => ({
      answered: sum.answered + Object.keys(r.answers).length,
      correct: sum.correct + r.correct,
    }),
    { answered: 0, correct: 0 },
  );
}
