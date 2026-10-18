import type { TFunction } from 'i18next';
import { todayIndex } from '@/features/tests/progress';
import { clock, relativeDay } from './dates';
import type { InboxGroup } from './inbox';
import type { InboxItem } from './types';

const WEEKDAY_KEYS = [
  'today.weekdays.0',
  'today.weekdays.1',
  'today.weekdays.2',
  'today.weekdays.3',
  'today.weekdays.4',
  'today.weekdays.5',
  'today.weekdays.6',
] as const;

const SHORT_DAY_KEYS = [
  'progress.weekDayNames.0',
  'progress.weekDayNames.1',
  'progress.weekDayNames.2',
  'progress.weekDayNames.3',
  'progress.weekDayNames.4',
  'progress.weekDayNames.5',
  'progress.weekDayNames.6',
] as const;

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

const month = (t: TFunction, date: Date) => t(MONTH_KEYS[date.getMonth()] ?? 'months.0');

/** Monday-first weekday name, full ("bazar ertəsi") or short ("B.e"). */
export function weekdayName(t: TFunction, index: number, short = false): string {
  return short
    ? t(SHORT_DAY_KEYS[index] ?? 'progress.weekDayNames.0')
    : t(WEEKDAY_KEYS[index] ?? 'today.weekdays.0');
}

/** "bazar, 18 oktyabr" above the screen title (shown in capitals). */
export function todayDateLine(t: TFunction, now: Date): string {
  return t('today.dateLine', {
    weekday: weekdayName(t, todayIndex(now)),
    day: now.getDate(),
    month: month(t, now),
  });
}

/** A deadline relative to now: "Sabah 23:59", "Bu gün 18:00" or "24 oktyabr, 23:59". */
export function dueLabel(t: TFunction, dueAt: Date, now: Date): string {
  const time = clock(dueAt);
  const relation = relativeDay(dueAt, now);
  if (relation === 'today') return t('today.due.today', { time });
  if (relation === 'tomorrow') return t('today.due.tomorrow', { time });
  return t('today.due.date', { day: dueAt.getDate(), month: month(t, dueAt), time });
}

/** Inbox time: the clock for today and yesterday, the date for older days. */
export function inboxTime(t: TFunction, at: Date, now: Date): string {
  const relation = relativeDay(at, now);
  return relation === 'today' || relation === 'yesterday'
    ? clock(at)
    : `${at.getDate()} ${month(t, at)}`;
}

/** Day heading of an inbox group: "Bu gün", "Dünən" or "16 oktyabr" (shown in capitals). */
export function inboxDayHeading(t: TFunction, group: InboxGroup): string {
  if (group.relation === 'today') return t('today.inbox.today');
  if (group.relation === 'yesterday') return t('today.inbox.yesterday');
  return `${group.date.getDate()} ${month(t, group.date)}`;
}

/** "Sabah 23:59" inside a sentence: "sabah 23:59". Labels start with a word or a digit. */
const lowerFirst = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);

/** Title and body of a notification, written from its event. */
export function inboxText(
  t: TFunction,
  item: InboxItem,
  now: Date,
): { title: string; body: string } {
  switch (item.kind) {
    case 'answerReady':
      return {
        title: t('today.inbox.item.answerReady.title'),
        body: t('today.inbox.item.answerReady.body', { teacher: item.teacher }),
      };
    case 'newAssignment':
      return {
        title: t('today.inbox.item.newAssignment.title', { className: item.className }),
        body: t('today.inbox.item.newAssignment.body', {
          title: item.title,
          due: lowerFirst(dueLabel(t, new Date(item.dueAt), now)),
        }),
      };
    case 'reviewDue':
      return {
        title: t('today.inbox.item.reviewDue.title'),
        body: t('today.inbox.item.reviewDue.body', { count: item.cells, minutes: item.minutes }),
      };
    case 'streak':
      return {
        title: t('today.inbox.item.streak.title', { count: item.days }),
        body: t('today.inbox.item.streak.body'),
      };
    case 'weeklySummary':
      return {
        title: t('today.inbox.item.weeklySummary.title'),
        body: t('today.inbox.item.weeklySummary.body', {
          count: item.topics,
          accuracy: item.accuracy,
        }),
      };
  }
}
