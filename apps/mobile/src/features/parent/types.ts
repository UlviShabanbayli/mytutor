/**
 * View types of the parent area for the demo. The real schemas (ParentLink, Grant, Consent and
 * the weekly report) come with the parent API (architecture V1–V3) into packages/schemas.
 */

/** What a child can choose to show a parent (architecture "Rollar və icazələr"). */
export type ShareCategory = 'report' | 'progress' | 'assignments' | 'exam';

export const SHARE_CATEGORIES: readonly ShareCategory[] = [
  'report',
  'progress',
  'assignments',
  'exam',
];

/** Mastery level of one topic cell (same code names as the `HexCell` states, ADR 0001). */
export type Mastery =
  'not_started' | 'lesson_completed' | 'mastered' | 'reinforced' | 'needs_practice';

/**
 * - `active`: linked; the parent sees what the child shares.
 * - `awaiting_consent`: a child under 13 is opening an account and needs the parent's consent.
 */
export type ChildLinkStatus = 'active' | 'awaiting_consent';

export type ChildLink = {
  childId: string;
  name: string;
  grade: number;
  /** The child's class ("7B") and its teacher, when the child is in a class. */
  className: string | null;
  teacherName: string | null;
  status: ChildLinkStatus;
  underThirteen: boolean;
  /** The categories the child shares; the server leaves out everything else. */
  grants: ShareCategory[];
};

/** This week at a glance on the child's card (only when the child shares the report). */
export type WeekOverview = {
  weekStart: string;
  minutes: number;
  activeDays: number;
  newTopics: number;
  /** Null when the child does not share assignments. */
  assignments: { onTime: number; total: number } | null;
  lastActiveAt: string | null;
  /** The parent has not opened this week's report yet. */
  reportIsNew: boolean;
};

export type ChildOverview = ChildLink & { week: WeekOverview | null };

/** The parent's own code request, waiting for the child's approval. */
export type LinkRequest = {
  childId: string;
  childName: string;
  sentAt: string;
  expiresAt: string;
};

export type TopicRef = { number: string; title: string };

export type WeekReport = {
  /** Monday of the week (ISO). */
  weekStart: string;
  minutes: number;
  previousMinutes: number | null;
  /** Monday first, seven days. */
  activeDays: boolean[];
  answers: { correct: number; total: number };
  newTopics: TopicRef[];
  /** A unit (çərçivə) whose every topic became honey this week. */
  completedUnit: string | null;
  weakSpots: TopicRef[];
  assignments: { onTime: number; total: number } | null;
  /** Estimated readiness in percent; null when not shared or no plan exists. */
  examReadiness: number | null;
  teacherNote: { teacherId: string; teacherName: string; text: string } | null;
};

/** One page of the report: a week by its offset from the latest week (0 = this week). */
export type ReportPage = { report: WeekReport | null; hasPrevious: boolean; hasNext: boolean };

export type UnitProgress = {
  number: string;
  title: string;
  topics: { number: string; level: Mastery }[];
};

export type TestScore = {
  id: string;
  kind: 'practice' | 'unit';
  /** Topic number for a practice test, unit number for a unit test. */
  ref: string;
  takenAt: string;
  questions: number;
  correct: number;
};

export type SubjectProgress = {
  subjectId: string;
  title: string;
  book: string;
  units: UnitProgress[];
  recentTests: TestScore[];
};

export type AssignmentState = 'not_started' | 'in_progress' | 'late' | 'submitted' | 'checked';

export type Assignment = {
  id: string;
  title: string;
  dueAt: string;
  state: AssignmentState;
  progress: { done: number; total: number } | null;
  lateDays: number;
  submittedAt: string | null;
  onTime: boolean;
  score: { kind: 'points'; value: number; max: number } | { kind: 'percent'; value: number } | null;
};

export type AssignmentList = { classLabel: string; items: Assignment[] };

export type ClassNote = { id: string; className: string; text: string; at: string };

export type ChatMessage = {
  id: string;
  from: 'teacher' | 'me';
  text: string;
  at: string;
  status: 'sent' | 'read';
  reported: boolean;
};

export type TeacherContact = {
  teacherId: string;
  name: string;
  firstName: string;
  /** "7B · Riyaziyyat" */
  classLabel: string;
  childName: string;
};

export type Conversation = TeacherContact & {
  last: { text: string; at: string; fromMe: boolean } | null;
  latestNote: ClassNote | null;
  unread: number;
};

export type Thread = TeacherContact & { notes: ClassNote[]; messages: ChatMessage[] };

export type ParentNotification =
  | { id: string; kind: 'weekly_report'; childId: string; childName: string; at: string }
  | { id: string; kind: 'teacher_message'; teacherId: string; teacherName: string; at: string };

export type NotificationKind = 'weeklyReport' | 'assignmentLate' | 'longBreak' | 'teacherMessage';

export const NOTIFICATION_KINDS: readonly NotificationKind[] = [
  'weeklyReport',
  'assignmentLate',
  'longBreak',
  'teacherMessage',
];

export type NotificationPrefs = Record<NotificationKind, boolean>;

export type ParentProfile = { name: string; phoneMasked: string };

/** A child under 13 whose account waits for the parent's SMS consent. */
export type ConsentRequest = { childId: string; childName: string; phoneMasked: string };
