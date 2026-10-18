/** 134 → "2:14" (video time, test duration). */
export function formatClock(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

/** Whole minutes between two moments, at least 1. */
export function minutesBetween(from: number, to: number): number {
  return Math.max(1, Math.round((to - from) / 60_000));
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** Whether a moment falls in the current week (weeks start on Monday in Azerbaijan). */
export function isThisWeek(iso: string, now = new Date()): boolean {
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const time = new Date(iso).getTime();
  return time >= monday.getTime() && time < addDays(monday, 7).getTime();
}
