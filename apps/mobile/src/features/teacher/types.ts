import type { CellState } from '@/components/ui';

/*
 * VIEW types of the teacher area for the demo (architecture M1–M8). The real domain schemas
 * come with the teacher API in packages/schemas; until then these describe what the screens
 * show, nothing more.
 */

/** Where a question, an AI answer or a review comes from: book, section, optional page. */
export type SourceView = { book: string; section: string; page?: number };

/** A platform topic every material and assignment is bound to (the textbook's contents). */
export type TopicView = { id: string; title: string; page?: number };

/** M1: unverified teachers open free classes; verified ones unlock paid classes and more. */
export type VerificationStatus = 'unverified' | 'pending' | 'verified';

export type TeacherProfile = {
  name: string;
  subject: string;
  grade: number;
  verification: VerificationStatus;
  /** When the documents were sent (pending verification). */
  submittedAt: string | null;
  listing: TutorListingPreview;
};

/** M8: the marketplace profile; visible to students only after verification. */
export type TutorListingPreview = {
  /** Price per hour in manat; null until the teacher sets it. */
  pricePerHour: number | null;
  subjects: string[];
  gradeFrom: number;
  gradeTo: number;
  exams: 'graduation_9'[];
  /** Weekdays, Monday = 0. */
  days: number[];
  hours: string;
  bio: string;
  reviewCount: number;
  /** Income this month in manat; null while there are no paid classes. */
  monthIncome: number | null;
};

export type ClassGroup = { id: string; name: string; memberIds: string[] };

export type TeacherClass = {
  id: string;
  /** "7B": shown inside the class hexagon. */
  shortName: string;
  name: string;
  subject: string;
  book: string;
  grade: number;
  paid: boolean;
  inviteCode: string;
  groups: ClassGroup[];
  studentCount: number;
  activeThisWeek: number;
  activeAssignments: number;
  /** Share of assigned work done, 0–1. */
  completion: number;
  chatOpen: boolean;
  chatUnread: number;
};

export type ClassMember = {
  id: string;
  name: string;
  /** The student allowed the teacher to see their overall progress (Rollar və icazələr). */
  sharesProgress: boolean;
  mutedInChat: boolean;
};

export type AssignmentKind = 'lesson' | 'test' | 'homework' | 'mock';

export type Audience =
  { type: 'class' } | { type: 'group'; groupId: string } | { type: 'students'; ids: string[] };

export type ClassAssignment = {
  id: string;
  classId: string;
  kind: AssignmentKind;
  topicId: string;
  /** Unit number of a unit test ("ana arı hüceyrəsi"). */
  unit?: number;
  /** Number of exercises of a homework. */
  exerciseCount?: number;
  audience: Audience;
  dueAt: string;
  done: number;
  total: number;
  /** Homework handed in and waiting for the teacher. */
  toGrade: number;
};

export type Announcement = { id: string; classId: string; text: string; at: string };

/** One step of a solution; `edited` once the teacher changed the AI's text. */
export type SolutionStep = { id: string; label: string; formula: string; edited?: boolean };

/** M6: a student's question with the AI's first-pass solution. */
export type InboxQuestion = {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  topicId: string;
  askedAt: string;
  text: string;
  /** What the student wrote next to the photo. */
  note: string;
  /** The photo, drawn as a lined page with the formula the student wrote. */
  photo: { formula: string } | null;
  ai: { status: 'solving' | 'ready'; steps: SolutionStep[] };
  source: SourceView;
  /** Approved by the teacher: the student now sees "Müəllim təsdiqlədi". */
  approved: boolean;
};

export type Submission = {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  /** The handwritten pages as lines (a photo in the real app). */
  pages: string[][];
  ai: { correct: number[]; note: string; suggested: number };
  source: SourceView;
  grade: number | null;
  comment: string;
};

export type MaterialKind = 'lesson' | 'video' | 'test' | 'question';

export type Material = {
  id: string;
  kind: MaterialKind;
  title: string;
  /** Questions of a test, blocks of a lesson, minutes of a video. */
  size: number;
  views?: number;
  /** `class`: published to the teacher's own classes; catalog items go through review. */
  state: 'draft' | 'class' | 'in_review' | 'approved';
  updatedAt: string;
};

/** A question of our bank: included in a test as it is, never edited (M3). */
export type BankQuestion = { id: string; topicId: string; text: string; source: SourceView };

export type InsightRow = { studentId: string; name: string; levels: CellState[] };

export type ClassInsights = {
  classId: string;
  unit: number;
  days: number;
  topics: string[];
  completion: number;
  activeThisWeek: number;
  studentCount: number;
  /** Only students who allowed it; the rest are counted, never shown. */
  rows: InsightRow[];
  hiddenCount: number;
  missed: { id: string; text: string; source: SourceView; wrong: number; total: number }[];
};

export type LiveParticipant = {
  id: string;
  name: string;
  state: 'me' | 'muted' | 'hand' | 'weak';
};

export type LiveRoom = {
  id: string;
  classId: string;
  title: string;
  topicId: string;
  startsAt: string;
  minutes: number;
  present: number;
  total: number;
  participants: LiveParticipant[];
  hands: { studentId: string; name: string; at: string }[];
  board: string[];
  chatUnread: number;
};

export type ChatMessage = { id: string; author: string | null; text: string; at: string };

export type Conversation = {
  id: string;
  kind: 'class' | 'parent' | 'student';
  title: string;
  /** The parent's child, for "Valideyn · …". */
  child?: string;
  unread: number;
  messages: ChatMessage[];
};

export type TeacherNotice =
  | { id: string; kind: 'question'; name: string; at: string }
  | { id: string; kind: 'homework'; count: number; topicId: string; at: string }
  | { id: string; kind: 'verification'; at: string };
