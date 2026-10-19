import type { TestResult } from '@mytutor/types';

const dayKey = (date: Date) => date.toDateString();

/** Monday 00:00 of the week `now` is in (weeks start on Monday in Azerbaijan). */
function weekStart(now: Date): Date {
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return monday;
}

/** Questions answered on each day of the current week, Monday first. */
export function answeredPerDay(results: TestResult[], now = new Date()): number[] {
  const monday = weekStart(now);
  const keys = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    return dayKey(day);
  });
  const perDay = keys.map(() => 0);
  for (const r of results) {
    const i = keys.indexOf(dayKey(new Date(r.finishedAt)));
    if (i >= 0) perDay[i] = (perDay[i] ?? 0) + Object.keys(r.answers).length;
  }
  return perDay;
}

/** Answered and correct this week; accuracy is null while nothing is answered. */
export function weekAccuracy(
  results: TestResult[],
  now = new Date(),
): { answered: number; correct: number; percent: number | null } {
  const from = weekStart(now).getTime();
  const week = results.filter((r) => new Date(r.finishedAt).getTime() >= from);
  const answered = week.reduce((sum, r) => sum + Object.keys(r.answers).length, 0);
  const correct = week.reduce((sum, r) => sum + r.correct, 0);
  return { answered, correct, percent: answered ? Math.round((correct / answered) * 100) : null };
}

/** Days of the week that reached the daily goal. */
export const goalDays = (perDay: number[], goal: number) => perDay.filter((n) => n >= goal).length;

/** The value the chart's full height stands for: room above the goal line and the best day. */
export const chartMax = (perDay: number[], goal: number) => Math.max(goal * 1.5, ...perDay);
