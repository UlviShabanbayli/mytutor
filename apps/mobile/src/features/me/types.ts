import type {
  AssignmentKind,
  BadgeId,
  BoardLine,
  LeagueId,
  Material,
  ParentRelation,
  RankId,
  StudentPlan,
} from '@mytutor/types';
import type { CellState, IconName } from '@/components/ui';
import type { ColorName } from '@/theme';
import type { When } from './format';

// VIEW types of the "Mən" area. The data comes from the demo world (`/v1/me`, `/v1/classes`,
// `/v1/assignments`, `/v1/messages`, `/v1/league`; shapes in packages/schemas/src/domain) and is
// mapped to these shapes in `fromWorld.ts`, with moments as relative days in Baku time.

export { LEAGUE_IDS, RANK_IDS } from '@mytutor/schemas';
export type {
  BadgeId,
  LeagueId,
  LeagueRow,
  LeagueTable,
  PlanFeature,
  RankId,
} from '@mytutor/types';

export type BadgeView = {
  id: BadgeId;
  icon: IconName;
  fill: ColorName;
  ink: ColorName;
};

export type MeOverview = {
  personId: string;
  /** The name the app greets with (the account's name until the student gives one). */
  name: string;
  grade: number;
  nickname: string;
  shields: number;
  points: number;
  weekPoints: number;
  /** Days in a row with the daily goal met. */
  streak: number;
  /** Topics at "Bal" (mastered) or better. */
  honeyCells: number;
  rank: RankId;
  /** The next rank and the points it starts at; null at the top rank. */
  nextRank: { id: RankId; minPoints: number } | null;
  /** Earned badges only. */
  badges: BadgeView[];
  badgesTotal: number;
  unreadInClasses: number;
  /** Classes the student is in; none on the first day. */
  classCount: number;
  /** This week's league; null before the first points. */
  league: { id: LeagueId; place: number } | null;
  plan: StudentPlan;
};

export type GuestOverview = { points: number; honeyCells: number };

export type TextbookProgress = {
  id: string;
  title: string;
  /** "soon": the textbook is not processed yet (shown as "Hazırlanır"). */
  status: 'ready' | 'soon';
  topics: number;
  units: number;
  levels: Record<CellState, number>;
};

export type ClassSummary = {
  id: string;
  short: string;
  name: string;
  teacherId: string;
  teacher: string;
  teacherInitials: string;
  students: number;
  unread: number;
  newMessages: number;
  newAnnouncements: number;
  nextAssignment: { id: string; title: string; due: When } | null;
  nextLive: When | null;
  jar: { percent: number; done: number; goal: number; mine: number };
};

export type AssignmentStatus = 'not_started' | 'submitted' | 'checked';

export type ClassAssignment = {
  id: string;
  kind: AssignmentKind;
  /** Topic number ("4.2"). */
  topic: string;
  topicId: string;
  title: string;
  questions?: number;
  due: When;
  status: AssignmentStatus;
  grade?: { score: number; max: number };
  /** Where "Başla" leads for a test assignment (a test id of the study area). */
  testId?: string;
};

export type ClassMaterial = {
  id: string;
  kind: Material['kind'];
  title: string;
  /** KB for a file, questions for a test, blocks for a lesson, seconds for a video. */
  size: number;
};

export type ClassFeed = {
  announcement: { id: string; text: string; time: When } | null;
  live: { id: string; when: When; topic: string } | null;
  /** `date` is an ISO day (YYYY-MM-DD). */
  recording: { id: string; date: string; title: string; minutes: number } | null;
  assignments: ClassAssignment[];
  materials: ClassMaterial[];
};

export type AssignmentDetail = {
  id: string;
  classId: string;
  className: string;
  title: string;
  description: string;
  due: When;
  status: AssignmentStatus;
  topic: { id: string; number: string; title: string; source: string };
  attachment: { name: string; sizeKb: number } | null;
  submission: { sentAt: When; photos: number } | null;
  feedback: {
    teacher: string;
    initials: string;
    time: When;
    score: number;
    max: number;
    text: string;
  } | null;
};

export type ChatMessage = {
  id: string;
  author: string;
  initials: string;
  role: 'teacher' | 'student';
  mine?: boolean;
  text: string;
  time: string;
  replyTo?: string;
};

export type LiveSession = {
  id: string;
  classId: string;
  title: string;
  teacher: string;
  initials: string;
  className: string;
  time: string;
  participants: number;
  unreadChat: number;
  /** Connection quality of the student's device in the demo room. */
  network: 'good' | 'weak';
  board: { lines: BoardLine[] };
  source: string;
};

export type ParentLinkView = {
  /** The parent's person id. */
  id: string;
  name: string;
  relation: ParentRelation;
  /** ISO day the link was made. */
  since: string;
};

export type ParentRequest = { id: string; name: string; relation: ParentRelation };
