import type { TFunction } from 'i18next';
import { clockTime } from './calendar';
import type { ExamGoal } from './goal';
import { daysLabel, subjectName, weekdayName } from './labels';
import type { Deadline } from './types';

export type DeadlineText = {
  title: string;
  body: string;
  tag: string;
  tagTone: 'info' | 'ok' | 'honey' | 'neutral';
};

type Context = { goal: ExamGoal | null; daysLeft: number; registered: boolean };

/** The words of a deadline row, by kind. */
export function deadlineText(t: TFunction, d: Deadline, ctx: Context): DeadlineText {
  switch (d.kind) {
    case 'assignment':
      return {
        title: t('exam.deadlines.assignmentTitle', { className: d.className }),
        body: t('exam.deadlines.assignmentBody', {
          subject: subjectName(t, d.subject),
          topic: d.topic,
          time: clockTime(d.date),
        }),
        tag: t('exam.deadlines.assignmentTag'),
        tagTone: 'info',
      };
    case 'registrationEnds':
      return {
        title: t('exam.deadlines.registrationTitle'),
        body: t('exam.deadlines.registrationBody', {
          number: d.mockNumber,
          time: clockTime(d.date),
        }),
        tag: ctx.registered
          ? t('exam.deadlines.registeredTag')
          : t('exam.deadlines.registrationOpenTag'),
        tagTone: ctx.registered ? 'ok' : 'honey',
      };
    case 'mock': {
      const when = t('exam.when', { weekday: weekdayName(t, d.date), time: clockTime(d.date) });
      return {
        title: t('exam.deadlines.mockTitle', {
          number: d.mockNumber,
          subject: subjectName(t, d.subject),
        }),
        body: d.registrationOpen
          ? t('exam.deadlines.mockBody', { when })
          : t('exam.deadlines.mockBodyLater', { when }),
        tag: t('exam.deadlines.mockTag'),
        tagTone: 'honey',
      };
    }
    case 'officialRegistration':
      return {
        title: t('exam.deadlines.officialRegistrationTitle'),
        body: t('exam.deadlines.officialRegistrationBody'),
        tag: t('exam.deadlines.waitingTag'),
        tagTone: 'neutral',
      };
    case 'officialExam': {
      const goal = ctx.goal;
      const title = !goal
        ? t('exam.deadlines.officialRegistrationTitle')
        : goal.exam === 'admission'
          ? t('exam.deadlines.officialExamAdmission', { group: goal.group ?? '' })
          : t('exam.deadlines.officialExamGraduation', {
              grade: t('common.grade', {
                count: goal.exam === 'graduation_9' ? 9 : 11,
                ordinal: true,
              }),
            });
      return {
        title,
        body: t('exam.deadlines.officialExamBody', { days: daysLabel(t, ctx.daysLeft) }),
        tag: t('exam.deadlines.waitingTag'),
        tagTone: 'neutral',
      };
    }
  }
}
