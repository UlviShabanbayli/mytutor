import type { CellState, IconName } from '@/components/ui';
import type { ColorName } from '@/theme';
import type { When } from './format';

// VIEW types of the "Mən" area for the demo. The real shapes come with the motivation,
// classes, parent-link and entitlement APIs (architecture Ş10, Ş11, V1, P2, P4) and will live
// in packages/schemas then.

/** Ranks in order (design: Sürfə → Gənc arı → İşçi arı → Bal ustası → Pətək ustası). */
export const RANK_IDS = ['larva', 'young', 'worker', 'honeyMaster', 'hiveMaster'] as const;
export type RankId = (typeof RANK_IDS)[number];

/** Weekly leagues in order (design: Yonca → Lalə → Qızılgül → Nərgiz → Xarıbülbül). */
export const LEAGUE_IDS = ['clover', 'tulip', 'rose', 'narcissus', 'kharibulbul'] as const;
export type LeagueId = (typeof LEAGUE_IDS)[number];

export type BadgeId = 'firstHoney' | 'week' | 'precise' | 'mock' | 'sealMaster';

export type BadgeView = {
  id: BadgeId;
  icon: IconName;
  fill: ColorName;
  ink: ColorName;
};

export type MeOverview = {
  name: string;
  /** Demo grade, used only when first launch did not pick one. */
  grade: number;
  shields: number;
  points: number;
  weekPoints: number;
  /** Topics at "Bal" (mastered) or better. */
  honeyCells: number;
  badges: BadgeView[];
  badgesTotal: number;
  unreadInClasses: number;
  league: { id: LeagueId; place: number };
  plan: 'free' | 'premium';
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

export type LeagueRow = { place: number; nickname: string; points: number; me?: boolean };

export type LeagueTable = {
  league: LeagueId;
  /** Place of the student in the table. */
  place: number;
  daysLeft: number;
  promote: number;
  demote: number;
  rows: LeagueRow[];
};

export type ClassSummary = {
  id: string;
  short: string;
  name: string;
  teacher: string;
  teacherInitials: string;
  students: number;
  unread: number;
  newMessages: number;
  newAnnouncements: number;
  nextAssignment: { title: string; due: When };
  nextLive: When;
  jar: { percent: number; done: number; goal: number; mine: number };
};

export type AssignmentStatus = 'not_started' | 'submitted' | 'checked';

export type ClassAssignment = {
  id: string;
  kind: 'test' | 'homework';
  topic: string;
  title: string;
  questions?: number;
  due: When;
  status: AssignmentStatus;
  grade?: { score: number; max: number };
  /** Where "Başla" leads for a test assignment (a test id of the study area). */
  testId?: string;
};

export type ClassFeed = {
  announcement: { id: string; text: string; time: When };
  live: { id: string; when: When; topic: string };
  /** `date` is an ISO day (YYYY-MM-DD). */
  recording: { id: string; date: string; title: string; minutes: number };
  assignments: ClassAssignment[];
  materials: { id: string; kind: 'file' | 'lesson'; title: string; meta: string }[];
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
  attachment: { name: string; size: string };
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
  /** Connection quality of the student's device (demo). */
  network: 'good' | 'weak';
  board: { lines: { text: string; tone: 'ink' | 'honey'; size: 'lg' | 'md'; indent?: boolean }[] };
  source: string;
};

export type ParentLinkView = {
  id: string;
  name: string;
  relation: 'mother' | 'father' | 'guardian';
  /** ISO day the link was made. */
  since: string;
};

export type ParentRequest = { id: string; name: string; relation: ParentLinkView['relation'] };

/** A plan feature row: what free and premium give. */
export type PlanFeature = {
  id: 'lessons' | 'review' | 'askAi' | 'askPhoto' | 'examPlan' | 'videos' | 'offline';
  free: 'yes' | 'no' | 'limited' | 'basic' | 'some';
  premium: 'yes' | 'unlimited' | 'full' | 'all';
};
