import type { DemoWorld } from '@mytutor/types';
import { DEMO_ACCOUNTS } from '../accounts';
import { withExamGoal } from '../exam/goal';
import { selectAskQuestion, selectAskQuestions, selectAskUsage } from './ask';
import {
  selectAssignment,
  selectAssignments,
  selectClassFeed,
  selectClasses,
  selectClassLive,
  selectJoin,
} from './classes';
import { roleOf, type DemoRequest } from './common';
import { goalFromQuery, selectLeaderboard, selectMock } from './exam';
import { selectCurriculum, selectHive, selectPlacement } from './learn';
import { selectLeague, selectMe } from './me';
import { selectNotifications, selectThread, selectThreads } from './messages';
import {
  selectChildAssignments,
  selectChildProgress,
  selectChildReport,
  selectNotificationPrefs,
  selectParentCode,
  selectParentHome,
} from './parent';
import { selectLesson, selectMistakes, selectReview, selectTest } from './study';
import {
  selectBank,
  selectInbox,
  selectInboxQuestion,
  selectInsights,
  selectMaterials,
  selectSubmissions,
  selectTeacherAssignments,
  selectTeacherClass,
  selectTeacherHome,
  selectTeacherLive,
} from './teacher';
import { selectToday } from './today';

/**
 * Every demo resource under /v1, one selector each. The API registers these routes and the
 * app's offline fallback answers from the same table, so both return identical JSON. A
 * selector's null is a 404.
 */
export type DemoRoute = {
  path: string;
  select: (world: DemoWorld, req: DemoRequest) => unknown;
};

const exam = (world: DemoWorld, req: DemoRequest) =>
  withExamGoal(world, goalFromQuery(world, req.query)).exam;

const p = (req: DemoRequest, name: string) => req.params[name] ?? '';

export const DEMO_ROUTES: DemoRoute[] = [
  { path: '/v1/me', select: (w) => selectMe(w) },
  { path: '/v1/today', select: (w) => selectToday(w) },
  { path: '/v1/curriculum', select: (w) => selectCurriculum(w) },
  { path: '/v1/hive', select: (w) => selectHive(w) },
  { path: '/v1/hive/placement', select: (w) => selectPlacement(w) },
  { path: '/v1/hive/:subjectId', select: (w, r) => selectHive(w, p(r, 'subjectId')) },
  { path: '/v1/lessons/:id', select: (w, r) => selectLesson(w, p(r, 'id')) },
  { path: '/v1/tests/:id', select: (w, r) => selectTest(w, p(r, 'id')) },
  { path: '/v1/review', select: (w) => selectReview(w) },
  { path: '/v1/mistakes', select: (w) => selectMistakes(w) },
  { path: '/v1/exam', select: exam },
  { path: '/v1/exam/plan', select: (w, r) => exam(w, r).plan },
  { path: '/v1/exam/weak-spots', select: (w, r) => exam(w, r).weakSpots },
  { path: '/v1/exam/mocks', select: (w, r) => exam(w, r).mocks },
  { path: '/v1/exam/mocks/:id', select: (w, r) => selectMock(w, p(r, 'id')) },
  { path: '/v1/exam/deadlines', select: (w, r) => exam(w, r).deadlines },
  { path: '/v1/exam/leaderboard/:scope', select: (w, r) => selectLeaderboard(w, p(r, 'scope')) },
  { path: '/v1/ask/questions', select: (w) => selectAskQuestions(w) },
  { path: '/v1/ask/questions/:id', select: (w, r) => selectAskQuestion(w, p(r, 'id')) },
  { path: '/v1/ask/usage', select: (w) => selectAskUsage(w) },
  { path: '/v1/classes', select: (w) => selectClasses(w) },
  { path: '/v1/classes/join/:code', select: (w, r) => selectJoin(w, p(r, 'code')) },
  { path: '/v1/classes/:id', select: (w, r) => selectClassFeed(w, p(r, 'id')) },
  { path: '/v1/classes/:id/live', select: (w, r) => selectClassLive(w, p(r, 'id')) },
  { path: '/v1/assignments', select: (w) => selectAssignments(w) },
  { path: '/v1/assignments/:id', select: (w, r) => selectAssignment(w, p(r, 'id')) },
  { path: '/v1/messages', select: (w, r) => selectThreads(w, roleOf(r.query)) },
  { path: '/v1/messages/:id', select: (w, r) => selectThread(w, p(r, 'id'), roleOf(r.query)) },
  { path: '/v1/notifications', select: (w, r) => selectNotifications(w, roleOf(r.query)) },
  {
    path: '/v1/league',
    select: (w, r) => selectLeague(w, r.query.scope === 'class' ? 'class' : 'country'),
  },
  { path: '/v1/parent', select: (w) => selectParentHome(w) },
  {
    path: '/v1/parent/children/:id/report',
    select: (w, r) => selectChildReport(w, p(r, 'id'), Math.max(0, Number(r.query.week ?? 0) || 0)),
  },
  {
    path: '/v1/parent/children/:id/progress',
    select: (w, r) => selectChildProgress(w, p(r, 'id')),
  },
  {
    path: '/v1/parent/children/:id/assignments',
    select: (w, r) => selectChildAssignments(w, p(r, 'id')),
  },
  { path: '/v1/parent/codes/:code', select: (w, r) => selectParentCode(w, p(r, 'code')) },
  { path: '/v1/parent/messages', select: (w) => selectThreads(w, 'parent') },
  { path: '/v1/parent/messages/:id', select: (w, r) => selectThread(w, p(r, 'id'), 'parent') },
  { path: '/v1/parent/notifications', select: (w) => selectNotifications(w, 'parent') },
  { path: '/v1/parent/prefs', select: (w) => selectNotificationPrefs(w) },
  { path: '/v1/teacher', select: (w) => selectTeacherHome(w) },
  { path: '/v1/teacher/classes/:id', select: (w, r) => selectTeacherClass(w, p(r, 'id')) },
  { path: '/v1/teacher/assignments', select: (w) => selectTeacherAssignments(w) },
  {
    path: '/v1/teacher/assignments/:id/submissions',
    select: (w, r) => selectSubmissions(w, p(r, 'id')),
  },
  { path: '/v1/teacher/inbox', select: (w) => selectInbox(w) },
  { path: '/v1/teacher/inbox/:id', select: (w, r) => selectInboxQuestion(w, p(r, 'id')) },
  { path: '/v1/teacher/materials', select: (w) => selectMaterials(w) },
  { path: '/v1/teacher/bank', select: (w) => selectBank(w) },
  { path: '/v1/teacher/insights/:classId', select: (w, r) => selectInsights(w, p(r, 'classId')) },
  { path: '/v1/teacher/live', select: (w) => selectTeacherLive(w) },
  { path: '/v1/teacher/messages', select: (w) => selectThreads(w, 'teacher') },
  { path: '/v1/teacher/messages/:id', select: (w, r) => selectThread(w, p(r, 'id'), 'teacher') },
  { path: '/v1/teacher/notifications', select: (w) => selectNotifications(w, 'teacher') },
  { path: '/v1/demo/accounts', select: () => DEMO_ACCOUNTS },
];
