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

/** The first `weekday` (Monday = 0) at least `minDays` days after `today`, at hours:minutes. */
export function upcomingWeekday(
  today: Date,
  weekday: number,
  minDays: number,
  hours: number,
  minutes: number,
): Date {
  let ahead = (weekday - weekdayIndex(today) + 7) % 7;
  while (ahead < minDays) ahead += 7;
  const day = addDays(startOfDay(today), ahead);
  day.setHours(hours, minutes, 0, 0);
  return day;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** "11:00" */
export function clockTime(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Days until an ISO date (YYYY-MM-DD), never below zero; null for a malformed date. */
export function daysUntilIso(iso: string, today: Date): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Math.max(0, daysBetween(today, date));
}
