import type { TFunction } from 'i18next';
import { formatDateTime } from '@/i18n/formatDateTime';
import { upperCase } from '@/lib/letterCase';

const MONTH_KEYS = [
  'months.0',
  'months.1',
  'months.2',
  'months.3',
  'months.4',
  'months.5',
  'months.6',
  'months.7',
  'months.8',
  'months.9',
  'months.10',
  'months.11',
] as const;

const pad = (n: number) => String(n).padStart(2, '0');

/** Local calendar day, e.g. "2026-9-18" (months from 0); equal keys mean the same day. */
export function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

/** Whole local days from `date` to `now`: 0 today, 1 yesterday. */
export function daysAgo(date: Date, now: Date): number {
  const start = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return Math.round((start(now) - start(date)) / 86_400_000);
}

/** "14:02". */
export function formatClock(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** "18 oktyabr" (month names from i18n). */
export function formatDayMonth(t: TFunction, date: Date): string {
  return t('ask.state.dayMonth', {
    day: date.getDate(),
    month: t(MONTH_KEYS[date.getMonth()] ?? 'months.0'),
  });
}

/** List meta of a question: the time today, "Dünən", or the date. */
export function relativeDay(t: TFunction, date: Date, now: Date): string {
  const ago = daysAgo(date, now);
  if (ago === 0) return formatClock(date);
  if (ago === 1) return t('ask.state.yesterday');
  return formatDayMonth(t, date);
}

/** The time today, otherwise "15 oktyabr, 14:02". */
export function shortWhen(t: TFunction, date: Date, now: Date): string {
  return daysAgo(date, now) === 0 ? formatClock(date) : formatDateTime(t, date);
}

/** CAPS day heading of a group: "BU GÜN", "DÜNƏN", "15 OKTYABR". */
export function dayHeading(t: TFunction, date: Date, now: Date, locale: string): string {
  const ago = daysAgo(date, now);
  if (ago === 0) return t('ask.state.today');
  if (ago === 1) return t('ask.state.yesterdayCaps');
  return upperCase(formatDayMonth(t, date), locale);
}
