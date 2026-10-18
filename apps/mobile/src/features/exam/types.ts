import type { CellState } from '@/components/ui';
import type { OptionKey } from '@mytutor/types';

/*
 * View types of the exam area for the demo. The real shapes come with the exam API
 * (architecture Ş7: /v1/exams, /v1/me/plan, /v1/mock-exams, /v1/leaderboards/*) and will
 * live in packages/schemas then.
 */

/** Subjects an exam can contain; names come from i18n (`exam.subjects.*`). */
export type ExamSubject =
  | 'math'
  | 'physics'
  | 'chemistry'
  | 'biology'
  | 'geography'
  | 'history'
  | 'azLanguage'
  | 'literature'
  | 'foreignLanguage';

/** A subject of the chosen exam and how ready the student is for it. */
export type SubjectReadiness =
  | { subject: ExamSubject; ready: true; percent: number; weakCount: number }
  | { subject: ExamSubject; ready: false };

/** Where a plan step leads: the work itself, opened with one tap. */
export type StepTarget =
  | { kind: 'review' }
  | { kind: 'lesson'; id: string }
  | { kind: 'test'; id: string }
  | { kind: 'topic'; id: string };

export type StepKind = 'review' | 'lesson' | 'test';
export type StepState = 'done' | 'now' | 'next';

/** Why the tutor put a step in today's plan. */
export type StepReason =
  | { kind: 'chainRoot'; topic: string }
  | { kind: 'mockErrors'; mocks: number; errors: number }
  | { kind: 'questions'; count: number; range: string }
  | { kind: 'moved' };

export type PlanStep = {
  id: string;
  kind: StepKind;
  /** Topic name as the textbook writes it (content, not an interface string). */
  title: string;
  minutes: number;
  state: StepState;
  /** Downloaded, so it opens without internet. */
  saved: boolean;
  reason: StepReason;
  target: StepTarget;
};

export type DayMark = 'done' | 'plan' | 'moved';

/** One day of the rolling week strip, relative to today. */
export type PlanDay = {
  offset: number;
  missed: boolean;
  marks: DayMark[];
};

export type ExamPlan = {
  /** When the plan was last recalculated ("07:00"). */
  updatedAt: string;
  days: PlanDay[];
  today: PlanStep[];
  /** Steps of a missed day spread over the coming days; null when nothing was missed. */
  moved: number | null;
};

export type Evidence =
  | { kind: 'recent'; mocks: number; errors: number }
  | { kind: 'last'; asked: number; wrong: number }
  | { kind: 'some'; mocks: number; errors: number };

/** One topic on the trail of a mistake, from the weak topic back to its root. */
export type ChainLink = {
  topic: string;
  title: string;
  grade: number;
  state: CellState;
  errors: number;
  /** The topic where the problem starts. */
  root: boolean;
  /** For a root without a textbook yet: the topics that rebuild it ("1.4–1.5"). */
  rebuildWith: string | null;
};

export type WeakSpot = {
  id: string;
  topic: string;
  title: string;
  /** Shorter name for the home preview. */
  short: string;
  state: CellState;
  evidence: Evidence;
  chain: ChainLink[];
  fixSteps: number;
  fixMinutes: number;
};

export type WeakSpotsReport = {
  mocks: number;
  errors: number;
  /** "6-cı sinif kəsrləri": where most mistakes lead. */
  commonRoot: string;
  spots: WeakSpot[];
};

export type MockKind = 'scheduled' | 'self';

export type MockGroup = {
  id: string;
  /** Unit title (content), e.g. "Müxtəsər vurma düsturları". */
  title: string;
  /** Short label for the question header, e.g. "Müxtəsər vurma". */
  short: string;
};

export type MockQuestion = {
  id: string;
  prompt: 'compute' | 'simplify' | 'expand' | 'factor';
  /** The expression, in plain Unicode maths. */
  expression: string;
  options: { key: OptionKey; text: string }[];
  correctKey: OptionKey;
  groupId: string;
  /** Textbook topic the question practises ("4.1"). */
  topic: string;
};

export type MockExam = {
  id: string;
  kind: MockKind;
  subject: ExamSubject;
  /** "Ümumi sınaq #3" or "Variant 2". */
  number: number;
  durationMinutes: number;
  groups: MockGroup[];
  questions: MockQuestion[];
};

/** A row of the mocks list. */
export type MockListItem =
  | {
      id: string;
      subject: ExamSubject;
      number: number;
      questionCount: number;
      status: 'new' | 'done';
      lastPercent: number | null;
      lastDate: Date | null;
    }
  | { id: string; subject: ExamSubject; preparing: true };

export type ScheduledMock = {
  id: string;
  subject: ExamSubject;
  number: number;
  startsAt: Date;
  registrationEndsAt: Date;
};

export type LeaderboardScope = 'class' | 'country';

export type LeaderboardEntry = { rank: number; nick: string; score: number; minutes: number };

export type Leaderboard = {
  scope: LeaderboardScope;
  participants: number;
  top: LeaderboardEntry[];
  /** Rows just above the student's place. */
  around: LeaderboardEntry[];
  you: LeaderboardEntry & { topPercent: number };
};

export type Deadline =
  | {
      kind: 'assignment';
      id: string;
      date: Date;
      className: string;
      subject: ExamSubject;
      topic: string;
    }
  | { kind: 'registrationEnds'; id: string; date: Date; mockNumber: number }
  | {
      kind: 'mock';
      id: string;
      date: Date;
      mockNumber: number;
      subject: ExamSubject;
      registrationOpen: boolean;
    }
  | { kind: 'officialRegistration'; id: string; date: null }
  | { kind: 'officialExam'; id: string; date: null };
