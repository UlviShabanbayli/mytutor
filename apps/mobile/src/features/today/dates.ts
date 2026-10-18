// Calendar helpers of the "Bu gün" area. Days are the student's local days, not UTC.

const pad = (n: number) => String(n).padStart(2, '0');

/** The local calendar day of a moment as "YYYY-MM-DD". */
export function dayKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Whole days from one day key to another; positive when `to` is later. DST-safe. */
export function daysBetween(from: string, to: string): number {
  const utc = (key: string) => {
    const [y = 0, m = 1, d = 1] = key.split('-').map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((utc(to) - utc(from)) / 86_400_000);
}

export type DayRelation = 'today' | 'yesterday' | 'tomorrow' | 'other';

/** How a moment's day relates to now's day. */
export function relativeDay(date: Date, now: Date): DayRelation {
  const diff = daysBetween(dayKey(now), dayKey(date));
  if (diff === 0) return 'today';
  if (diff === -1) return 'yesterday';
  if (diff === 1) return 'tomorrow';
  return 'other';
}

/** "09:05" */
export function clock(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
