import type { TFunction } from 'i18next';

// Month and weekday names come from i18n: platform Intl data for `az` is often incomplete.
const MONTHS = [
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

const MONTHS_SHORT = [
  'parent.date.monthsShort.0',
  'parent.date.monthsShort.1',
  'parent.date.monthsShort.2',
  'parent.date.monthsShort.3',
  'parent.date.monthsShort.4',
  'parent.date.monthsShort.5',
  'parent.date.monthsShort.6',
  'parent.date.monthsShort.7',
  'parent.date.monthsShort.8',
  'parent.date.monthsShort.9',
  'parent.date.monthsShort.10',
  'parent.date.monthsShort.11',
] as const;

/** Monday first, as the week strip in the report. */
const WEEKDAYS = [
  'parent.date.weekdays.0',
  'parent.date.weekdays.1',
  'parent.date.weekdays.2',
  'parent.date.weekdays.3',
  'parent.date.weekdays.4',
  'parent.date.weekdays.5',
  'parent.date.weekdays.6',
] as const;

const WEEKDAYS_LONG = [
  'parent.date.weekdaysLong.0',
  'parent.date.weekdaysLong.1',
  'parent.date.weekdaysLong.2',
  'parent.date.weekdaysLong.3',
  'parent.date.weekdaysLong.4',
  'parent.date.weekdaysLong.5',
  'parent.date.weekdaysLong.6',
] as const;

const DAY_MS = 86_400_000;
const pad = (n: number) => String(n).padStart(2, '0');

export const formatTime = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const addDays = (date: Date, days: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

/** Calendar days from `date` to `now`: 0 the same day, 1 yesterday. */
export const daysBetween = (date: Date, now: Date) =>
  Math.round((startOfDay(now).getTime() - startOfDay(date).getTime()) / DAY_MS);

const monthName = (t: TFunction, date: Date, short: boolean) =>
  t((short ? MONTHS_SHORT : MONTHS)[date.getMonth()] ?? 'months.0');

/** "17 oktyabr", or "17 okt" when `short`. */
export const formatDayMonth = (t: TFunction, date: Date, short = false) =>
  t('parent.date.dayMonth', { day: date.getDate(), month: monthName(t, date, short) });

/** "21 okt, 23:59" */
export const formatDayMonthTime = (t: TFunction, date: Date) =>
  t('parent.date.dayMonthTime', {
    day: date.getDate(),
    month: monthName(t, date, true),
    time: formatTime(date),
  });

/** "Bu gün", "Dünən" or "17 oktyabr" (chat day separators). */
export function formatDayLabel(t: TFunction, date: Date, now: Date) {
  const days = daysBetween(date, now);
  if (days === 0) return t('parent.date.today');
  if (days === 1) return t('parent.date.yesterday');
  return formatDayMonth(t, date);
}

/** "bu gün, 17:52", "dünən, 18:20" or "17 okt, 18:20" inside a sentence. */
export function formatWhen(t: TFunction, date: Date, now: Date) {
  const days = daysBetween(date, now);
  if (days === 0) return t('parent.date.todayAt', { time: formatTime(date) });
  if (days === 1) return t('parent.date.yesterdayAt', { time: formatTime(date) });
  return formatDayMonthTime(t, date);
}

/** Only the time on the same day ("17:40"), the date too otherwise. */
export const formatClock = (t: TFunction, date: Date, now: Date) =>
  daysBetween(date, now) === 0 ? formatTime(date) : formatDayMonthTime(t, date);

/** "12–18 oktyabr"; across months "28 sentyabr – 4 oktyabr". */
export function formatWeekRange(t: TFunction, start: Date, short = false) {
  const end = addDays(start, 6);
  if (end.getMonth() === start.getMonth()) {
    return t('parent.date.range', {
      from: start.getDate(),
      to: end.getDate(),
      month: monthName(t, start, short),
    });
  }
  return t('parent.date.rangeCross', {
    from: formatDayMonth(t, start, short),
    to: formatDayMonth(t, end, short),
  });
}

export const weekdayName = (t: TFunction, index: number, long = false) =>
  t((long ? WEEKDAYS_LONG : WEEKDAYS)[index] ?? 'parent.date.weekdays.0');

/** "2 saat 10 dəq" (`long`) or "2 s 10 dəq" (`short`). */
export function formatDuration(t: TFunction, minutes: number, style: 'long' | 'short' = 'long') {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (style === 'short') {
    if (h === 0) return t('parent.duration.short.minutes', { m });
    if (m === 0) return t('parent.duration.short.hours', { h });
    return t('parent.duration.short.hoursMinutes', { h, m });
  }
  if (h === 0) return t('parent.duration.long.minutes', { m });
  if (m === 0) return t('parent.duration.long.hours', { h });
  return t('parent.duration.long.hoursMinutes', { h, m });
}
