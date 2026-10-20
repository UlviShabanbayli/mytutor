import type { DemoEvent, DemoWorld, WeekReport } from '@mytutor/types';
import { makeClock } from '../clock';

/**
 * A finished test: its result joins the student's recent results (Me, the parent) and today's
 * numbers in the last seven days (the week chart, the parent's report). Minutes are counted as a
 * minute a question; the answers are the test's own.
 */

type Of<T extends DemoEvent['type']> = Extract<DemoEvent, { type: T }>;

/** Seven empty days ending today, for a student with no week yet. */
function emptyWeek(w: DemoWorld): WeekReport {
  const clock = makeClock(new Date(w.now));
  return {
    weekStart: clock.at(-6),
    minutes: 0,
    previousMinutes: null,
    activeDays: Array.from({ length: 7 }, () => false),
    days: Array.from({ length: 7 }, (_, i) => ({
      date: clock.at(i - 6),
      minutes: 0,
      answered: 0,
      correct: 0,
    })),
    answers: { correct: 0, total: 0 },
    newTopics: [],
    completedUnit: null,
    weakSpots: [],
    assignments: null,
    examReadiness: null,
    teacherNote: null,
  };
}

export function testFinished(w: DemoWorld, e: Of<'test.finished'>) {
  if (!w.people.some((p) => p.id === e.studentId)) return;
  const answered = Math.min(e.answered, e.total);
  const correct = Math.min(e.correct, answered);
  w.testScores[e.studentId] = [
    {
      id: e.id,
      kind: e.kind,
      ref: e.ref,
      testId: e.testId,
      title: e.title,
      takenAt: e.at,
      questions: e.total,
      correct,
    },
    ...(w.testScores[e.studentId] ?? []),
  ];
  const weeks = (w.weekReports[e.studentId] ??= []);
  const week = weeks[0] ?? emptyWeek(w);
  if (!weeks[0]) weeks.unshift(week);
  const index = 6 + makeClock(new Date(w.now)).daysUntil(e.at);
  const day = week.days[index];
  if (!day) return;
  day.minutes += Math.max(1, answered);
  day.answered += answered;
  day.correct += correct;
  week.activeDays = week.days.map((d) => d.minutes > 0);
  week.minutes = week.days.reduce((n, d) => n + d.minutes, 0);
  week.answers = {
    correct: week.days.reduce((n, d) => n + d.correct, 0),
    total: week.days.reduce((n, d) => n + d.answered, 0),
  };
  if (e.studentId === w.student.personId && index === 6) {
    w.activity.minutesToday = day.minutes;
    w.activity.todayAccuracy = day.answered ? Math.round((day.correct / day.answered) * 100) : 0;
    w.activity.lastActiveAt = e.at;
  }
}
