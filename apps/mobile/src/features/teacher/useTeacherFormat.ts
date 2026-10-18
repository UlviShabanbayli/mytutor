import { useTranslation } from 'react-i18next';
import { audienceSize } from './classroom';
import { clockTime, dayOffset, dueStatus, minutesSince } from './time';
import type { Audience, ClassAssignment, SourceView, TeacherClass, TopicView } from './types';

const MONTHS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'] as const;
const monthKey = (d: Date) => MONTHS[d.getMonth()] ?? '0';

/** Teacher-area wording of dates, sources, audiences and assignment titles. */
export function useTeacherFormat() {
  const { t } = useTranslation();

  /** "19 oktyabr". */
  const date = (d: Date) =>
    t('teacher.date', { day: d.getDate(), month: t(`months.${monthKey(d)}`) });

  /** "17 oktyabrda" (az) / "17 октября" (ru). */
  const dateIn = (d: Date) => ({ day: d.getDate(), month: t(`teacher.monthsIn.${monthKey(d)}`) });

  /** "bu gün 09:10", "dünən 21:40", "16 oktyabr, 18:00". */
  const dayAt = (d: Date, now = new Date()) => {
    const days = dayOffset(d, now);
    const time = clockTime(d);
    if (days === 0) return t('teacher.dayAt.today', { time });
    if (days === -1) return t('teacher.dayAt.yesterday', { time });
    return t('teacher.dayAt.date', { date: date(d), time });
  };

  /** "indicə", "4 dəq əvvəl", "dünən", "2 gün əvvəl". */
  const ago = (d: Date, now = new Date()) => {
    const minutes = minutesSince(d, now);
    if (minutes < 1) return t('teacher.ago.now');
    if (minutes < 60) return t('teacher.ago.minutes', { count: minutes });
    const days = -dayOffset(d, now);
    if (days <= 0) return t('teacher.ago.hours', { count: Math.floor(minutes / 60) });
    if (days === 1) return t('teacher.ago.yesterday');
    return t('teacher.ago.days', { count: days });
  };

  /** Minutes a question has waited, "4 dəq". */
  const wait = (askedAt: string, now = new Date()) =>
    t('teacher.minutesShort', { count: Math.max(1, minutesSince(new Date(askedAt), now)) });

  /** "Riyaziyyat 7 (TRİMS), 1-ci hissə · 4.1 · s. 83", plus "· demo" for demo text. */
  const source = (s: SourceView) => {
    const line =
      s.page === undefined
        ? t('teacher.source.section', { book: s.book, section: s.section })
        : t('teacher.source.page', { book: s.book, section: s.section, page: s.page });
    return s.demo ? t('teacher.source.demo', { source: line }) : line;
  };

  const topicLine = (topic: TopicView | undefined, id: string) =>
    topic ? t('teacher.topicLine', { id: topic.id, title: topic.title }) : id;

  const assignmentTitle = (a: ClassAssignment, topic: TopicView | undefined) => {
    if (a.kind === 'mock') return t('teacher.assignment.unitTestTitle', { unit: a.unit ?? 0 });
    if (a.kind === 'homework')
      return t('teacher.assignment.homeworkTitle', {
        topic: a.topicId,
        count: a.exerciseCount ?? 0,
      });
    return topicLine(topic, a.topicId);
  };

  const audience = (aud: Audience, cls: TeacherClass) => {
    if (aud.type === 'class') return t('teacher.assignment.wholeClass');
    if (aud.type === 'group') {
      const group = cls.groups.find((g) => g.id === aud.groupId);
      const count = audienceSize(aud, cls.studentCount, cls.groups);
      return t('teacher.assignment.group', { name: group?.name ?? '', count });
    }
    return t('teacher.assignment.picked', { count: aud.ids.length });
  };

  /** "Bitdi", "Bu gün 23:59", "Sabah 23:59" or "22 oktyabr". */
  const due = (dueAt: string, now = new Date()) => {
    const d = new Date(dueAt);
    switch (dueStatus(d, now)) {
      case 'past':
        return t('teacher.assignment.duePast');
      case 'today':
        return t('teacher.assignment.dueToday', { time: clockTime(d) });
      case 'tomorrow':
        return t('teacher.assignment.dueTomorrow', { time: clockTime(d) });
      case 'later':
        return date(d);
    }
  };

  return { date, dateIn, dayAt, ago, wait, source, topicLine, assignmentTitle, audience, due };
}
