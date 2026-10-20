import type {
  AskQuestionView,
  ChatThreadView,
  ClassInsights,
  LiveParticipant,
  SolutionStep,
  TeacherAssignment,
  TeacherClassView,
  TeacherProfile,
} from '@mytutor/types';

/*
 * What the teacher screens show (architecture M1–M8). The shapes are the demo world's domain
 * types from @mytutor/types; these add only what a screen needs on top of them (a topic's
 * number and title, a name). views.ts maps the API's answers to them, so components never
 * read the raw answers.
 */

/** A textbook topic as the teacher area shows it: "4.1 · Cəmin və fərqin kvadratı". */
export type TopicView = { id: string; number: string; title: string; page: number };

/** A unit of the ready textbook volume, with the book and part it is in. */
export type UnitView = {
  id: string;
  number: string;
  /** "Riyaziyyat 7 (TRİMS)". */
  bookTitle: string;
  part: number;
  topics: TopicView[];
};

/** The teacher's profile with her name. */
export type TeacherProfileView = TeacherProfile & { name: string };

/** A class with the book line under its name ("Riyaziyyat 7"). */
export type TeacherClass = TeacherClassView & { book: string };

/** An assignment with its topic and, for a unit test, the unit's number. */
export type ClassAssignment = TeacherAssignment & {
  topic: TopicView | null;
  unitNumber: string | null;
};

/** M6: a student's question with the steps to show (the teacher's once answered). */
export type InboxQuestion = AskQuestionView & {
  askedAt: string;
  /** Answered by the teacher: the student now sees "Müəllim təsdiqlədi". */
  approved: boolean;
  aiStatus: 'solving' | 'ready';
  steps: SolutionStep[];
};

/** M7: the class report, with the unit's number for the subtitle. */
export type InsightsView = ClassInsights & { unitNumber: string };

/** A tile in the live room; the teacher's own tile is `me`. */
export type LiveTile = {
  id: string;
  name: string;
  state: 'me' | Exclude<LiveParticipant['state'], 'speaking'>;
};

/** M5: the live room with names on the tiles and the board as lines of text. */
export type LiveRoom = {
  id: string;
  classId: string;
  title: string;
  topic: TopicView | null;
  startsAt: string;
  minutes: number;
  present: number;
  total: number;
  participants: LiveTile[];
  hands: { studentId: string; name: string; at: string }[];
  board: string[];
  chatUnread: number;
};

/** A conversation in the list, with the child a parent writes about. */
export type Conversation = ChatThreadView & { childName: string | null };

/** The bell's list: who asked, which homework waits, the verification. */
export type TeacherNotice =
  | { id: string; read: boolean; at: string; kind: 'question'; name: string }
  | { id: string; read: boolean; at: string; kind: 'homework'; count: number; topic: string }
  | { id: string; read: boolean; at: string; kind: 'verification' };
