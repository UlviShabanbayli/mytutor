import type { TFunction } from 'i18next';

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

/** "8 oktyabr, 00:31" — month names come from i18n, not platform Intl data. */
export function formatDateTime(t: TFunction, date: Date): string {
  return t('dateTime', {
    day: date.getDate(),
    month: t(MONTH_KEYS[date.getMonth()] ?? 'months.0'),
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  });
}
