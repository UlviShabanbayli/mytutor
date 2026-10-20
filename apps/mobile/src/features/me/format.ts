import type { TFunction } from 'i18next';
import type { ClassMaterial } from './types';

/** 2140 → "2 140" (a no-break space between thousands, as Azerbaijani and Russian write them). */
export function formatNumber(value: number): string {
  return String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/** A day of the demo data: relative words or a weekday (0 = Monday), with an optional time. */
export type When = {
  day: 'today' | 'yesterday' | 'tomorrow' | 0 | 1 | 2 | 3 | 4 | 5 | 6;
  time?: string;
};

const WEEKDAY_KEYS = [
  'me.when.weekdays.0',
  'me.when.weekdays.1',
  'me.when.weekdays.2',
  'me.when.weekdays.3',
  'me.when.weekdays.4',
  'me.when.weekdays.5',
  'me.when.weekdays.6',
] as const;

/** "Cümə 20:00", "Bu gün 09:12", "Sabah". */
export function formatWhen(t: TFunction, when: When): string {
  const day =
    typeof when.day === 'number'
      ? t(WEEKDAY_KEYS[when.day] ?? 'me.when.weekdays.0')
      : t(`me.when.${when.day}`);
  return when.time ? t('me.when.dayTime', { day, time: when.time }) : day;
}

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

const SHORT_MONTH_KEYS = [
  'me.when.monthsShort.0',
  'me.when.monthsShort.1',
  'me.when.monthsShort.2',
  'me.when.monthsShort.3',
  'me.when.monthsShort.4',
  'me.when.monthsShort.5',
  'me.when.monthsShort.6',
  'me.when.monthsShort.7',
  'me.when.monthsShort.8',
  'me.when.monthsShort.9',
  'me.when.monthsShort.10',
  'me.when.monthsShort.11',
] as const;

/** "2026-09-03" → "3 sentyabr"; `short` gives the capital label form "3 SEN". */
export function formatDay(t: TFunction, isoDate: string, short = false): string {
  const [, month = '1', day = '1'] = isoDate.split('-');
  const i = Number(month) - 1;
  const name = short
    ? t(SHORT_MONTH_KEYS[i] ?? 'me.when.monthsShort.0')
    : t(MONTH_KEYS[i] ?? 'months.0');
  return `${Number(day)} ${name}`;
}

/** "240 KB", "Video · 7 dəq", "Test · 3 sual": what a shared material is, by its kind. */
export function materialMeta(t: TFunction, m: Pick<ClassMaterial, 'kind' | 'size'>): string {
  switch (m.kind) {
    case 'file':
      return t('me.classPage.material.file', { size: m.size });
    case 'video':
      return t('me.classPage.material.video', { count: Math.max(1, Math.round(m.size / 60)) });
    case 'lesson':
      return t('me.classPage.material.lesson', { count: m.size });
    case 'test':
      return t('me.classPage.material.test', { count: m.size });
    case 'question':
      return t('me.classPage.material.question');
  }
}
