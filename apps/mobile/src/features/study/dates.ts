import type { TFunction } from 'i18next';

const MONTHS = [
  'study.review.months.0',
  'study.review.months.1',
  'study.review.months.2',
  'study.review.months.3',
  'study.review.months.4',
  'study.review.months.5',
  'study.review.months.6',
  'study.review.months.7',
  'study.review.months.8',
  'study.review.months.9',
  'study.review.months.10',
  'study.review.months.11',
] as const;

const WEEKDAYS = [
  'study.review.weekdays.0',
  'study.review.weekdays.1',
  'study.review.weekdays.2',
  'study.review.weekdays.3',
  'study.review.weekdays.4',
  'study.review.weekdays.5',
  'study.review.weekdays.6',
] as const;

/** "16 okt" — short month names from i18n, not platform Intl data (often incomplete for az). */
export const shortDate = (t: TFunction, date: Date) =>
  t('study.review.date', { day: date.getDate(), month: t(MONTHS[date.getMonth()] ?? MONTHS[0]) });

/** "Çərşənbə" (by Date#getDay(), Sunday first). */
export const weekday = (t: TFunction, date: Date) => t(WEEKDAYS[date.getDay()] ?? WEEKDAYS[0]);
