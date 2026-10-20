/** Local calendar helpers for the plan, the mocks and the deadlines (no time zones involved). */

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** Whole calendar days from `from` to `to` (negative when `to` is earlier). */
export function daysBetween(from: Date, to: Date): number {
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / 86_400_000);
}

/** Monday-based weekday 0–6, the order of the app's weekday names (B.e … B). */
export function weekdayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** "11:00" */
export function clockTime(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
