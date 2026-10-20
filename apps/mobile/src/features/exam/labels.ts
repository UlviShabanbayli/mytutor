import type { TFunction } from 'i18next';
import { weekdayIndex } from './calendar';
import type { ExamGoal } from './goal';
import type { Evidence, ExamSubject, MockKind } from './types';

// Interface words of the exam area built from data (numbers, dates, kinds) through i18n.

const WEEKDAYS = [
  'exam.weekdays.0',
  'exam.weekdays.1',
  'exam.weekdays.2',
  'exam.weekdays.3',
  'exam.weekdays.4',
  'exam.weekdays.5',
  'exam.weekdays.6',
] as const;

const WEEKDAYS_SHORT = [
  'progress.weekDayNames.0',
  'progress.weekDayNames.1',
  'progress.weekDayNames.2',
  'progress.weekDayNames.3',
  'progress.weekDayNames.4',
  'progress.weekDayNames.5',
  'progress.weekDayNames.6',
] as const;

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

const MONTH_NAMES = [
  'exam.monthNames.0',
  'exam.monthNames.1',
  'exam.monthNames.2',
  'exam.monthNames.3',
  'exam.monthNames.4',
  'exam.monthNames.5',
  'exam.monthNames.6',
  'exam.monthNames.7',
  'exam.monthNames.8',
  'exam.monthNames.9',
  'exam.monthNames.10',
  'exam.monthNames.11',
] as const;

const MONTHS_SHORT = [
  'exam.monthShort.0',
  'exam.monthShort.1',
  'exam.monthShort.2',
  'exam.monthShort.3',
  'exam.monthShort.4',
  'exam.monthShort.5',
  'exam.monthShort.6',
  'exam.monthShort.7',
  'exam.monthShort.8',
  'exam.monthShort.9',
  'exam.monthShort.10',
  'exam.monthShort.11',
] as const;

/** "Qəbul · II qrup", "Buraxılış · 11-ci sinif" */
export function goalLabel(t: TFunction, goal: ExamGoal): string {
  if (goal.exam !== 'admission') return t(`exam.kinds.${goal.exam}`);
  return goal.group
    ? t('exam.kinds.admissionGroup', { group: goal.group })
    : t('exam.kinds.admission');
}

export const subjectName = (t: TFunction, subject: ExamSubject) => t(`exam.subjects.${subject}`);

export const minutesLabel = (t: TFunction, count: number) => t('exam.minutes', { count });
export const daysLabel = (t: TFunction, count: number) => t('exam.days', { count });
export const errorsLabel = (t: TFunction, count: number) => t('exam.errors', { count });
export const stepsLabel = (t: TFunction, count: number) => t('exam.steps', { count });

/** "Riyaziyyat · Ümumi sınaq #3", "Riyaziyyat · Variant 2" */
export function mockTitle(
  t: TFunction,
  mock: { kind: MockKind; subject: ExamSubject; number: number },
): string {
  return t(`exam.mockTitle.${mock.kind}`, {
    subject: subjectName(t, mock.subject),
    number: mock.number,
  });
}

/** Why a topic is weak: "Son 3 sınaqda 7 səhv". */
export function evidenceText(t: TFunction, evidence: Evidence): string {
  switch (evidence.kind) {
    case 'recent':
      return t('exam.evidence.recent', {
        mocks: evidence.mocks,
        errors: errorsLabel(t, evidence.errors),
      });
    case 'last':
      return t('exam.evidence.last', { errors: errorsLabel(t, evidence.errors) });
    case 'some':
      return t('exam.evidence.some', {
        mocks: evidence.mocks,
        errors: errorsLabel(t, evidence.errors),
      });
  }
}

/** "Şənbə" */
export const weekdayName = (t: TFunction, date: Date) =>
  t(WEEKDAYS[weekdayIndex(date)] ?? 'exam.weekdays.0');

/** "Ş" (the short names of the week strip) */
export const weekdayShort = (t: TFunction, date: Date) =>
  t(WEEKDAYS_SHORT[weekdayIndex(date)] ?? 'progress.weekDayNames.0');

/** "24 oktyabr" */
export const dayMonth = (t: TFunction, date: Date) =>
  `${date.getDate()} ${t(MONTHS[date.getMonth()] ?? 'months.0')}`;

/** "NOYABR" (deadline group headings) */
export const monthHeading = (t: TFunction, month: number) =>
  t(MONTH_NAMES[month] ?? 'exam.monthNames.0');

/** "OKT" (date boxes) */
export const monthShort = (t: TFunction, month: number) =>
  t(MONTHS_SHORT[month] ?? 'exam.monthShort.0');
