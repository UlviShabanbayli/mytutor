import type { ExamKind } from '@mytutor/types';
import { addDays, upcomingWeekday } from './calendar';
import { DEMO_GROUPS, DEMO_QUESTIONS } from './demoQuestions';
import type { ExamGoal } from './goal';
import type {
  Deadline,
  ExamPlan,
  ExamSubject,
  Leaderboard,
  LeaderboardScope,
  MockExam,
  MockListItem,
  ScheduledMock,
  SubjectReadiness,
  WeakSpotsReport,
} from './types';

/*
 * Demo data until the exam API exists (architecture Ş7: /v1/exams, /v1/me/exam-goal,
 * /v1/me/plan, /v1/mock-exams, /v1/leaderboards/*). Topic names are the Riyaziyyat 7 (TRİMS)
 * table of contents; numbers, nicknames and dates are invented for the demo. No official DİM
 * date, duration or scoring rule is used: the countdown is a demo counter and the score is the
 * share of right answers.
 */

/** Demo countdown until the server sends the DİM date ("İmtahana 142 gün"). */
export const DEMO_DAYS_LEFT = 142;
/** The demo applicant's leaderboard nickname and class (design: Murad, 11A). */
export const DEMO_NICKNAME = 'Şahin_11';
export const DEMO_CLASS = '11A';
/** Places that win the general mock's badge and bonus variant (architecture P3; demo rule). */
export const DEMO_REWARD_PLACES = 50;
/** Demo duration of a mock; the real one comes with the exam structure from the server. */
export const DEMO_MOCK_MINUTES = 60;
/** Entitlements come from /v1/me/entitlements (architecture P4); the demo student has premium. */
export const DEMO_ACCESS = { fullPlan: true };

// Demo ids of the learn and study areas' routes (their real ids come with the content API).
const topicId = (n: string) => `riyaziyyat-7-${n.replace('.', '-')}`;

/**
 * Demo exam structure: which subjects each exam has. The real structure comes from the server
 * (/v1/exams); only Riyaziyyat has content today, the rest show "hazırlanır".
 */
const EXAM_SUBJECTS: Record<ExamKind, ExamSubject[]> = {
  graduation_9: ['azLanguage', 'math', 'foreignLanguage'],
  graduation_11: ['azLanguage', 'math', 'foreignLanguage'],
  admission: ['math'],
};
const ADMISSION_SUBJECTS: Record<string, ExamSubject[]> = {
  I: ['math', 'physics', 'chemistry'],
  II: ['math', 'geography', 'history'],
  III: ['azLanguage', 'history', 'literature'],
  IV: ['biology', 'chemistry', 'physics'],
  V: ['azLanguage', 'math', 'foreignLanguage'],
};

export function demoExamSubjects(exam: ExamKind, group: string | null): ExamSubject[] {
  return exam === 'admission' && group
    ? (ADMISSION_SUBJECTS[group] ?? EXAM_SUBJECTS.admission)
    : EXAM_SUBJECTS[exam];
}

export function demoReadiness(goal: ExamGoal): SubjectReadiness[] {
  return demoExamSubjects(goal.exam, goal.group).map((subject) =>
    subject === 'math'
      ? { subject, ready: true, percent: 58, weakCount: 3 }
      : { subject, ready: false },
  );
}

export function demoPlan(): ExamPlan {
  return {
    updatedAt: '07:00',
    moved: 2,
    days: [
      { offset: -3, missed: false, marks: ['done', 'done', 'done'] },
      { offset: -2, missed: false, marks: ['done', 'done', 'done'] },
      { offset: -1, missed: true, marks: [] },
      { offset: 0, missed: false, marks: ['done', 'plan', 'plan', 'moved'] },
      { offset: 1, missed: false, marks: ['plan', 'plan', 'moved'] },
      { offset: 2, missed: false, marks: ['plan', 'plan', 'plan'] },
      { offset: 3, missed: false, marks: ['plan', 'plan'] },
    ],
    today: [
      {
        id: 's1',
        kind: 'review',
        title: '1.5 Vurma və bölmə: kəsrlər',
        minutes: 8,
        state: 'done',
        saved: true,
        reason: { kind: 'chainRoot', topic: '6-cı sinif kəsrləri' },
        target: { kind: 'review' },
      },
      {
        id: 's2',
        kind: 'lesson',
        title: '4.5 Düsturlarla vuruqlara ayırma',
        minutes: 12,
        state: 'now',
        saved: true,
        reason: { kind: 'mockErrors', mocks: 3, errors: 7 },
        target: { kind: 'lesson', id: topicId('4.5') },
      },
      {
        id: 's3',
        kind: 'test',
        title: 'Müxtəsər vurma düsturları',
        minutes: 15,
        state: 'next',
        saved: true,
        reason: { kind: 'questions', count: 10, range: '4.1–4.5' },
        target: { kind: 'test', id: topicId('4') },
      },
      {
        id: 's4',
        kind: 'review',
        title: '2.2 Qüvvətlərin vurulması',
        minutes: 5,
        state: 'next',
        saved: false,
        reason: { kind: 'moved' },
        target: { kind: 'review' },
      },
    ],
  };
}

export function demoWeakSpots(): WeakSpotsReport {
  return {
    mocks: 3,
    errors: 14,
    commonRoot: '6-cı sinif kəsrləri',
    spots: [
      {
        id: 'w45',
        topic: '4.5',
        title: 'Düsturlarla vuruqlara ayırma',
        short: 'Vuruqlara ayırma',
        state: 'needs_practice',
        evidence: { kind: 'recent', mocks: 3, errors: 7 },
        fixSteps: 3,
        fixMinutes: 25,
        chain: [
          {
            topic: '4.5',
            title: 'Düsturlarla vuruqlara ayırma',
            grade: 7,
            state: 'needs_practice',
            errors: 7,
            root: false,
            rebuildWith: null,
          },
          {
            topic: '4.4',
            title: 'Çoxhədlilərin vuruqlara ayrılması',
            grade: 7,
            state: 'lesson_completed',
            errors: 2,
            root: false,
            rebuildWith: null,
          },
          {
            topic: '1.5',
            title: 'Rasional ədədlər: vurma və bölmə',
            grade: 7,
            state: 'needs_practice',
            errors: 5,
            root: false,
            rebuildWith: null,
          },
          {
            topic: '6',
            title: 'Kəsrlər üzərində əməllər',
            grade: 6,
            state: 'not_started',
            errors: 0,
            root: true,
            rebuildWith: 'Riyaziyyat 7, 1.4–1.5',
          },
        ],
      },
      {
        id: 'w22',
        topic: '2.2',
        title: 'Qüvvətlərin vurulması və bölünməsi',
        short: 'Qüvvətlərin vurulması',
        state: 'needs_practice',
        evidence: { kind: 'last', asked: 5, wrong: 3 },
        fixSteps: 2,
        fixMinutes: 15,
        chain: [
          {
            topic: '2.2',
            title: 'Qüvvətlərin vurulması və bölünməsi',
            grade: 7,
            state: 'needs_practice',
            errors: 3,
            root: false,
            rebuildWith: null,
          },
          {
            topic: '2.1',
            title: 'Natural üstlü qüvvət',
            grade: 7,
            state: 'lesson_completed',
            errors: 1,
            root: true,
            rebuildWith: null,
          },
        ],
      },
      {
        id: 'w55',
        topic: '5.5',
        title: 'Orta xətt və medianlar',
        short: 'Orta xətt və medianlar',
        state: 'lesson_completed',
        evidence: { kind: 'some', mocks: 2, errors: 3 },
        fixSteps: 3,
        fixMinutes: 20,
        chain: [
          {
            topic: '5.5',
            title: 'Orta xətt və medianlar',
            grade: 7,
            state: 'lesson_completed',
            errors: 3,
            root: false,
            rebuildWith: null,
          },
          {
            topic: '5.3',
            title: 'Paraleloqram',
            grade: 7,
            state: 'lesson_completed',
            errors: 1,
            root: false,
            rebuildWith: null,
          },
          {
            topic: '5.1',
            title: 'Həndəsənin ilkin anlayışları',
            grade: 7,
            state: 'not_started',
            errors: 2,
            root: true,
            rebuildWith: null,
          },
        ],
      },
    ],
  };
}

/** The next general mock: a Saturday at 11:00 at least three days ahead; registration closes two days before. */
export function demoScheduledMock(today: Date): ScheduledMock {
  const startsAt = upcomingWeekday(today, 5, 3, 11, 0);
  const registrationEndsAt = addDays(startsAt, -2);
  registrationEndsAt.setHours(23, 59, 0, 0);
  return { id: 'general-3', subject: 'math', number: 3, startsAt, registrationEndsAt };
}

export function demoMockList(today: Date): MockListItem[] {
  const questionCount = DEMO_QUESTIONS.length;
  return [
    {
      id: 'variant-1',
      subject: 'math',
      number: 1,
      questionCount,
      status: 'done',
      lastPercent: 64,
      lastDate: addDays(today, -6),
    },
    {
      id: 'variant-2',
      subject: 'math',
      number: 2,
      questionCount,
      status: 'new',
      lastPercent: null,
      lastDate: null,
    },
    {
      id: 'variant-3',
      subject: 'math',
      number: 3,
      questionCount,
      status: 'new',
      lastPercent: null,
      lastDate: null,
    },
    { id: 'geography', subject: 'geography', preparing: true },
    { id: 'history', subject: 'history', preparing: true },
  ];
}

const MOCKS: Record<string, { kind: MockExam['kind']; number: number; shift: number }> = {
  'general-3': { kind: 'scheduled', number: 3, shift: 0 },
  'variant-1': { kind: 'self', number: 1, shift: 0 },
  'variant-2': { kind: 'self', number: 2, shift: 5 },
  'variant-3': { kind: 'self', number: 3, shift: 10 },
};

/** A mock with the demo questions; variants start from a different topic. */
export function demoMock(id: string): MockExam | null {
  const entry = MOCKS[id];
  if (!entry) return null;
  const questions = [...DEMO_QUESTIONS.slice(entry.shift), ...DEMO_QUESTIONS.slice(0, entry.shift)];
  return {
    id,
    kind: entry.kind,
    subject: 'math',
    number: entry.number,
    durationMinutes: DEMO_MOCK_MINUTES,
    groups: DEMO_GROUPS,
    questions,
  };
}

const BOARDS: Record<LeaderboardScope, Leaderboard> = {
  country: {
    scope: 'country',
    participants: 1248,
    top: [
      { rank: 1, nick: 'Kəpənək_09', score: 98, minutes: 51 },
      { rank: 2, nick: 'Riyaziyyatçı_A', score: 96, minutes: 47 },
      { rank: 3, nick: 'Nar_dənəsi', score: 96, minutes: 55 },
      { rank: 4, nick: 'Ulduz_77', score: 95, minutes: 49 },
      { rank: 5, nick: 'Sakit_okean', score: 94, minutes: 58 },
    ],
    around: [
      { rank: 212, nick: 'Dağ_çiçəyi', score: 73, minutes: 56 },
      { rank: 213, nick: 'Qaranquş', score: 73, minutes: 60 },
    ],
    you: { rank: 214, nick: DEMO_NICKNAME, score: 72, minutes: 58, topPercent: 18 },
  },
  class: {
    scope: 'class',
    participants: 24,
    top: [
      { rank: 1, nick: 'Ulduz_77', score: 95, minutes: 49 },
      { rank: 2, nick: 'Qaranquş', score: 88, minutes: 57 },
      { rank: 3, nick: 'Nar_dənəsi', score: 84, minutes: 55 },
      { rank: 4, nick: 'Dağ_çiçəyi', score: 80, minutes: 56 },
      { rank: 5, nick: 'Sakit_okean', score: 76, minutes: 58 },
    ],
    around: [],
    you: { rank: 6, nick: DEMO_NICKNAME, score: 72, minutes: 58, topPercent: 25 },
  },
};

export function demoLeaderboard(scope: LeaderboardScope): Leaderboard {
  return BOARDS[scope];
}

export function demoDeadlines(today: Date): Deadline[] {
  const mock = demoScheduledMock(today);
  const assignment = addDays(today, 2);
  assignment.setHours(23, 59, 0, 0);
  return [
    {
      kind: 'assignment',
      id: 'd1',
      date: assignment,
      className: DEMO_CLASS,
      subject: 'math',
      topic: 'vuruqlara ayırma',
    },
    { kind: 'registrationEnds', id: 'd2', date: mock.registrationEndsAt, mockNumber: mock.number },
    {
      kind: 'mock',
      id: 'd3',
      date: mock.startsAt,
      mockNumber: mock.number,
      subject: 'math',
      registrationOpen: true,
    },
    {
      kind: 'mock',
      id: 'd4',
      date: addDays(mock.startsAt, 28),
      mockNumber: mock.number + 1,
      subject: 'math',
      registrationOpen: false,
    },
    { kind: 'officialRegistration', id: 'd5', date: null },
    { kind: 'officialExam', id: 'd6', date: null },
  ];
}
