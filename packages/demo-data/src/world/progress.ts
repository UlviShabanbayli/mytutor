import type {
  Assignment,
  MasteryMap,
  MistakeGroup,
  ReviewPlan,
  StudentActivity,
  Submission,
  TestScore,
  WeekReport,
} from '@mytutor/types';
import type { Clock } from '../clock';
import { demoSource, readyTopic, shortTitle } from '../curriculum';
import { LALE, NERMIN, R7, r7, testIdOf } from '../ids';
import { CURRENT_TOPIC, levelOf, topicsAt } from '../mastery';
import { personById } from '../people';
import { reviewTest } from '../tests';
import { MISTAKES } from './mistakeItems';

/** What Nərmin did (today, this week, last week) and what review and mistakes follow from it. */

/** Nərmin's 4.3 lesson: two of its four parts done (the `lesson-4-3` assignment follows it). */
export const NERMIN_LESSON_PROGRESS = { done: 2, total: 4 } as const;

export function activity(clock: Clock, studentId: string): StudentActivity {
  if (studentId !== NERMIN)
    return {
      minutesToday: 0,
      todayCells: 0,
      todayAccuracy: 0,
      lastActiveAt: null,
      unfinishedLesson: null,
      savedTopicIds: [],
    };
  const current = readyTopic(CURRENT_TOPIC);
  return {
    minutesToday: 12,
    todayCells: 2,
    todayAccuracy: 92,
    lastActiveAt: clock.ago(20),
    unfinishedLesson: {
      lessonId: current.id,
      code: current.number,
      title: current.shortTitle,
      subject: 'Riyaziyyat 7',
      part: 'examples',
      ...NERMIN_LESSON_PROGRESS,
    },
    savedTopicIds: ['3.1', '3.2', '3.3', '3.4', '3.5', '4.1', '4.2', '4.3'].map(r7),
  };
}

const cell = (topicId: string) => {
  const t = readyTopic(topicId);
  return { topicId: t.id, code: t.number, title: t.shortTitle };
};

/** Crystallized topics are due; the most recently mastered ones come up next. */
export function reviewPlan(map: MasteryMap): ReviewPlan {
  const due = topicsAt(map, 'needs_practice').map((t) => cell(t.id));
  const recent = topicsAt(map, 'mastered').reverse();
  const first = recent[0];
  const test = reviewTest(due);
  return {
    due,
    questionCount: test?.test.questions.length ?? 0,
    minutes: due.length * 2,
    example: {
      ...cell(first?.id ?? r7('1.1')),
      masteredDaysAgo: first ? 4 : 0,
      intervals: [2, 7, 21],
      done: first ? 1 : 0,
    },
    upcoming: first
      ? [
          { inDays: 1, cells: recent.slice(0, 1).map((t) => t.number) },
          { inDays: 4, cells: recent.slice(1, 3).map((t) => t.number) },
          { inDays: 6, cells: [] },
        ]
      : [],
    testId: test?.test.id ?? null,
  };
}

/** One group per weak topic (the current one and the crystallized ones) that has items. */
export function mistakeGroups(clock: Clock, map: MasteryMap): MistakeGroup[] {
  const weak = [...topicsAt(map, 'lesson_completed'), ...topicsAt(map, 'needs_practice')];
  return weak.flatMap((topic) => {
    const items = MISTAKES[topic.number];
    if (!items) return [];
    return [
      {
        id: `mistakes-${topic.id}`,
        topicId: topic.id,
        title: `${topic.number} · ${topic.shortTitle}`,
        cell: levelOf(map, topic.id),
        math: {},
        items: items.map(([stem, yours, right, explanation, daysAgo], i) => ({
          id: `m-${topic.number.replace('.', '-')}-${i + 1}`,
          stem,
          yours,
          right,
          explanation,
          source: demoSource(topic.id, 'demo sual'),
          subjectId: R7,
          finishedAt: clock.at(-daysAgo, 18, 30),
        })),
      },
    ];
  });
}

export function testScores(clock: Clock): Record<string, TestScore[]> {
  return {
    [NERMIN]: [
      {
        id: 'ts-4-2',
        kind: 'practice',
        ref: '4.2',
        testId: testIdOf(r7('4.2')),
        title: shortTitle(r7('4.2')),
        takenAt: clock.at(-1, 17, 0),
        questions: 3,
        correct: 2,
      },
      {
        id: 'ts-u3',
        kind: 'unit',
        ref: '3',
        testId: null,
        title: '3-cü çərçivə üzrə bölmə sınağı',
        takenAt: clock.at(-2, 11, 40),
        questions: 20,
        correct: 17,
      },
      {
        id: 'ts-4-1',
        kind: 'practice',
        ref: '4.1',
        testId: testIdOf(r7('4.1')),
        title: shortTitle(r7('4.1')),
        takenAt: clock.at(-3, 18, 0),
        questions: 3,
        correct: 3,
      },
    ],
  };
}

const ref = (number: string) => {
  const t = readyTopic(r7(number));
  return { topicId: t.id, number: t.number, title: t.shortTitle };
};

/** Minutes, answered and right answers per day, oldest first; totals and active days follow. */
type DayNumbers = [minutes: number, answered: number, correct: number][];

/** The last seven days: today is 12 minutes and 11 of 12 right (92%), as Today says. */
const THIS_WEEK: DayNumbers = [
  [25, 12, 10],
  [20, 10, 8],
  [0, 0, 0],
  [18, 9, 7],
  [22, 11, 9],
  [33, 10, 7],
  [12, 12, 11],
];
const LAST_WEEK: DayNumbers = [
  [0, 0, 0],
  [15, 8, 6],
  [18, 9, 7],
  [12, 7, 5],
  [20, 9, 7],
  [22, 9, 7],
  [18, 8, 6],
];

/** A week's numbers from its days, starting `fromDay` days from today. */
function weekOf(clock: Clock, fromDay: number, numbers: DayNumbers) {
  const days = numbers.map(([minutes, answered, correct], i) => ({
    date: clock.at(fromDay + i),
    minutes,
    answered,
    correct,
  }));
  return {
    weekStart: clock.at(fromDay),
    days,
    activeDays: days.map((d) => d.minutes > 0),
    minutes: days.reduce((n, d) => n + d.minutes, 0),
    answers: {
      correct: days.reduce((n, d) => n + d.correct, 0),
      total: days.reduce((n, d) => n + d.answered, 0),
    },
  };
}

/** Work due inside [from, to) and handed in on time. */
function onTime(list: Assignment[], subs: Submission[], from: string, to: string) {
  const due = list.filter((a) => a.classId === '7b' && a.dueAt >= from && a.dueAt < to);
  const mine = (id: string) => subs.find((s) => s.assignmentId === id && s.studentId === NERMIN);
  const done = due.filter((a) => {
    const at = mine(a.id)?.submittedAt;
    return at !== null && at !== undefined && at <= a.dueAt;
  });
  return { onTime: done.length, total: due.length };
}

/** The last seven days (ending today) and the seven before: one set of week numbers. */
export function weekReports(
  clock: Clock,
  map: MasteryMap,
  list: Assignment[],
  subs: Submission[],
): Record<string, WeekReport[]> {
  const thisWeek = clock.at(-6);
  const lastWeek = clock.at(-13);
  return {
    [NERMIN]: [
      {
        ...weekOf(clock, -6, THIS_WEEK),
        previousMinutes: weekOf(clock, -13, LAST_WEEK).minutes,
        newTopics: ['3.4', '3.5', '4.1', '4.2'].map(ref),
        completedUnit: '3',
        weakSpots: topicsAt(map, 'needs_practice').map((t) => ref(t.number)),
        assignments: onTime(list, subs, thisWeek, clock.later(1)),
        examReadiness: null,
        teacherNote: {
          teacherId: LALE,
          teacherName: personById(LALE).fullName,
          text: 'Nərmin bu həftə dərsdə çox fəal idi. Kub düsturlarını evdə 10 dəqiqə təkrar etsə, kifayətdir.',
        },
      },
      {
        // The streak (12 days up to yesterday) starts on this week's second day.
        ...weekOf(clock, -13, LAST_WEEK),
        previousMinutes: null,
        newTopics: ['3.2', '3.3'].map(ref),
        completedUnit: null,
        weakSpots: [ref('2.2')],
        assignments: onTime(list, subs, lastWeek, thisWeek),
        examReadiness: null,
        teacherNote: null,
      },
    ],
  };
}
