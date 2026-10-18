const DAY = 86_400_000;

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** Whole calendar days from `now` to `date`: 0 today, 1 tomorrow, −1 yesterday. */
export function dayOffset(date: Date, now: Date): number {
  return Math.round((startOfDay(date) - startOfDay(now)) / DAY);
}

/** Whole minutes `date` lies in the past (never negative). */
export function minutesSince(date: Date, now: Date): number {
  return Math.max(0, Math.floor((now.getTime() - date.getTime()) / 60_000));
}

/** Whole hours until `date` (rounded, never negative). */
export function hoursUntil(date: Date, now: Date): number {
  return Math.max(0, Math.round((date.getTime() - now.getTime()) / 3_600_000));
}

export type DueStatus = 'past' | 'today' | 'tomorrow' | 'later';

/** How an assignment's due date reads on its card: "Bitdi", "Bu gün", "Sabah" or the date. */
export function dueStatus(due: Date, now: Date): DueStatus {
  if (due.getTime() < now.getTime()) return 'past';
  const days = dayOffset(due, now);
  if (days <= 0) return 'today';
  if (days === 1) return 'tomorrow';
  return 'later';
}

/** A question waits too long once it passes this many minutes (the card turns red). */
export const LATE_AFTER_MINUTES = 15;

const pad = (n: number) => String(n).padStart(2, '0');

/** "16:00" in local time. */
export function clockTime(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Elapsed seconds as "18:42" (or "1:02:05" past an hour) for the live room clock. */
export function elapsedClock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const rest = `${pad(m)}:${pad(s % 60)}`;
  return h > 0 ? `${h}:${rest}` : rest;
}

/** 23:59 on the day `days` from now: the end of the day an assignment is due. */
export function dueAtOffset(days: number, now = new Date()): Date {
  const at = new Date(now);
  at.setDate(at.getDate() + days);
  at.setHours(23, 59, 0, 0);
  return at;
}
