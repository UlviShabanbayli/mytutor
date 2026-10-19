import type { ComebackData, InboxItem, MotivationData, TodayData } from './types';

// Demo data until the today API exists (architecture Ş2 GET /v1/me/today, P1 inbox,
// P2 GET /v1/me/motivation). Demo student Nərmin, 7th grade, Riyaziyyat 7 (TRİMS), class 7B
// with Lalə müəllim. Dates are relative to now so the demo always reads "today"/"tomorrow".
// The plan's practice step is NOT here: it is the real recommended test from the tests API.

const TEACHER = 'Lalə müəllim';
const CLASS_7B = '7B';
const MATH_7 = 'Riyaziyyat 7';

/** A moment `days` days from now (negative = past) at the given local time. */
function at(days: number, hours: number, minutes: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}

/** A moment the given number of minutes ago (today's notifications never lie in the future). */
function ago(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

export async function fetchToday(): Promise<TodayData> {
  return {
    studentName: null,
    plan: [
      {
        id: 'plan-review-2-2',
        kind: 'review',
        targetId: 'r7-2-2',
        code: '2.2',
        cell: 'needs_practice',
        title: 'Qüvvətlərin vurulması',
        reason: { kind: 'crystallized', daysAgo: 10 },
        minutes: 4,
        questionCount: null,
        points: 10,
      },
      {
        id: 'plan-lesson-4-3',
        kind: 'lesson',
        targetId: 'r7-4-3',
        code: '4.3',
        cell: 'lesson_completed',
        title: 'Cəmin və fərqin kubu',
        reason: { kind: 'unfinished', stepsLeft: 2 },
        minutes: 8,
        questionCount: null,
        points: 15,
      },
    ],
    unfinishedLesson: {
      lessonId: 'r7-4-3',
      code: '4.3',
      title: 'Cəmin və fərqin kubu',
      subject: MATH_7,
      part: 'examples',
      done: 2,
      total: 4,
    },
    assignments: [
      {
        id: 'hw-4-1',
        className: CLASS_7B,
        subject: 'Riyaziyyat',
        teacher: TEACHER,
        title: '4.1 çalışmaları',
        dueAt: at(1, 23, 59),
      },
    ],
    firstStep: {
      subjectId: 'riyaziyyat-7',
      subject: MATH_7,
      firstTopicId: 'r7-1-1',
      placementMinutes: 8,
      firstCellMinutes: 10,
    },
  };
}

/** Practice points of the recommended test step until the server's points table exists. */
export const DEMO_TEST_POINTS = 10;

export async function fetchMotivation(): Promise<MotivationData> {
  return {
    points: 340,
    minutesToday: 12,
    endedStreak: 12,
    restartMinutes: 10,
    freezesThisWeek: 1,
    todayCells: 2,
    todayPoints: 45,
    todayAccuracy: 92,
  };
}

export async function fetchComeback(): Promise<ComebackData> {
  return {
    awayDays: 9,
    crystals: [
      { topicId: 'r7-2-2', code: '2.2', title: 'Qüvvətlərin vurulması' },
      { topicId: 'r7-3-1', code: '3.1', title: 'Birhədlilər' },
      { topicId: 'r7-4-1', code: '4.1', title: 'Cəmin kvadratı' },
    ],
    reviewMinutes: 5,
  };
}

export async function fetchInbox(): Promise<InboxItem[]> {
  return [
    {
      id: 'n-answer',
      kind: 'answerReady',
      at: ago(25),
      read: false,
      questionId: 'q-demo-1',
      teacher: TEACHER,
    },
    {
      id: 'n-assignment',
      kind: 'newAssignment',
      at: ago(140),
      read: false,
      assignmentId: 'hw-4-1',
      className: CLASS_7B,
      title: '4.1 çalışmaları',
      dueAt: at(1, 23, 59),
    },
    { id: 'n-review', kind: 'reviewDue', at: ago(330), read: true, cells: 3, minutes: 5 },
    { id: 'n-streak', kind: 'streak', at: at(-1, 20, 14), read: true, days: 12 },
    {
      id: 'n-weekly',
      kind: 'weeklySummary',
      at: at(-1, 19, 0),
      read: true,
      topics: 6,
      accuracy: 82,
    },
  ];
}
