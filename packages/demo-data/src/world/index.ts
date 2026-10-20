import type { DemoPersona, DemoWorld, MasteryMap } from '@mytutor/types';
import { DEMO_SMS_CODE } from '../accounts';
import { makeClock } from '../clock';
import { DEFAULT_CHOICE, SUBJECTS, TEXTBOOKS } from '../curriculum';
import { mockExams, mockRuns } from '../exam/mocks';
import { noExam } from '../exam/goal';
import { FRESH, NERMIN } from '../ids';
import { LESSONS } from '../lessons';
import { rosterMastery } from '../mastery';
import { PEOPLE } from '../people';
import { TESTS, reviewTest } from '../tests';
import { PLACEMENT } from '../tests/placement';
import { askQuestions, ASK_LIMITS } from './ask';
import { assignments, submissions } from './assignments';
import { bank, missed } from './bank';
import { announcements, members, materials, recordings, CLASSES } from './classes';
import { liveLessons } from './live';
import { messages, threads } from './messages';
import { NOTIFICATION_PREFS, notifications } from './notifications';
import {
  badges,
  childLinks,
  codes,
  countryLeague,
  parentProfile,
  studentProfile,
  teacherProfile,
} from './profiles';
import { activity, mistakeGroups, reviewPlan, testScores, weekReports } from './progress';

export type BuildOptions = { now: Date; persona: DemoPersona };

/**
 * The demo world at `now`: deterministic (no randomness, no reading the clock), every date
 * relative to `now`. `nermin` is Nərmin's world; `fresh` is a first-day student's, with no
 * classes, an empty hive and no points. Teachers and parents see the same people either way.
 */
export function buildDemoWorld({ now, persona }: BuildOptions): DemoWorld {
  const clock = makeClock(now);
  const studentId = persona === 'nermin' ? NERMIN : FRESH;
  const mastery: Record<string, MasteryMap> = { ...rosterMastery(), [FRESH]: {} };
  const studentMap = mastery[studentId] ?? {};
  const student = studentProfile(studentId);
  const assignmentList = assignments(clock);
  const submissionList = submissions(clock);
  const questions = askQuestions(clock);
  const review = reviewPlan(studentMap);
  const reports = weekReports(clock, mastery[NERMIN] ?? {}, assignmentList, submissionList);
  const sentToday = questions.filter(
    (q) =>
      q.studentId === studentId &&
      q.timeline.some((e) => e.event === 'sent' && clock.daysUntil(e.at) === 0),
  ).length;
  return {
    now: clock.now,
    persona,
    smsCode: DEMO_SMS_CODE,
    people: PEOPLE,
    student,
    teacher: teacherProfile(clock),
    parent: parentProfile(),
    childLinks: childLinks(clock),
    codes: codes(clock),
    classes: CLASSES,
    members: members(clock),
    announcements: announcements(clock),
    materials: materials(clock),
    recordings: recordings(clock),
    curriculum: { subjects: SUBJECTS, textbooks: TEXTBOOKS, choices: [DEFAULT_CHOICE] },
    mastery,
    activity: activity(clock, studentId),
    lessons: LESSONS,
    tests: [...TESTS, ...[reviewTest(review.due)].flatMap((t) => t ?? [])],
    placement: PLACEMENT,
    review,
    mistakes: mistakeGroups(clock, studentMap),
    testScores: testScores(clock),
    assignments: assignmentList,
    submissions: submissionList,
    liveLessons: liveLessons(clock),
    askQuestions: questions,
    askUsage: {
      photoUsed: Math.min(sentToday, ASK_LIMITS.photo),
      photoLimit: ASK_LIMITS.photo,
      chatUsed: 0,
      chatLimit: ASK_LIMITS.chat,
    },
    bank: bank(),
    missed: missed(),
    threads: threads(clock),
    messages: messages(clock),
    notifications: notifications(clock, studentId, {
      streak: student.streak,
      review,
      week: reports[NERMIN]?.[0],
    }),
    notificationPrefs: NOTIFICATION_PREFS,
    countryLeague: countryLeague(),
    badges: badges(clock, studentId),
    weekReports: reports,
    mocks: mockExams(clock),
    mockRuns: persona === 'nermin' ? mockRuns(clock) : [],
    exam: noExam(student.goal),
  };
}
