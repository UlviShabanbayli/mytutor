import type { CellState } from '@/components/ui';

// VIEW types of the "Bu gün" area for the demo. The real shapes come with the today, motivation
// and inbox API (architecture Ş2 GET /v1/me/today, P2 GET /v1/me/motivation, P1 inbox) and will
// live in packages/schemas then.

/** Where a plan step leads: lessons, tests, review, topics, assignments and mocks. */
export type StepKind = 'review' | 'lesson' | 'test' | 'topic' | 'assignment' | 'mock';

/** Why the plan suggests a step; the screen always shows the reason. */
export type StepReason =
  | { kind: 'crystallized'; daysAgo: number }
  | { kind: 'unfinished'; stepsLeft: number }
  | { kind: 'mistakes'; count: number }
  | { kind: 'questions'; count: number }
  | { kind: 'assignment'; className: string }
  | { kind: 'examPlan' };

export type PlanStep = {
  id: string;
  kind: StepKind;
  /** Id of the lesson, test, topic or assignment the step opens (unused for review and mocks). */
  targetId: string;
  /** Topic number shown in the cell, e.g. "4.3"; null for a test-bank test without one. */
  code: string | null;
  /** Mastery of the step's topic, drawn as the hex cell. */
  cell: CellState;
  /** Content title (textbook language), e.g. "Cəmin və fərqin kubu". */
  title: string;
  reason: StepReason;
  /** Estimated minutes; null when unknown (a whole test-bank test). */
  minutes: number | null;
  /** Questions in a test step, shown when the minutes are unknown. */
  questionCount: number | null;
  points: number;
};

/** Parts of a lesson (architecture Ş4: text, video, worked examples, exercises). */
export type LessonPart = 'text' | 'video' | 'examples' | 'exercises';

/** The unfinished lesson the student left; a running test takes its place when there is one. */
export type UnfinishedLesson = {
  lessonId: string;
  code: string;
  title: string;
  subject: string;
  part: LessonPart;
  done: number;
  total: number;
};

/** A class assignment due soon (architecture Ş10). */
export type AssignmentDue = {
  id: string;
  className: string;
  subject: string;
  teacher: string;
  title: string;
  dueAt: string;
};

/** First day: where to start in the recommended textbook. */
export type FirstStep = {
  subjectId: string;
  subject: string;
  firstTopicId: string;
  placementMinutes: number;
  firstCellMinutes: number;
};

export type TodayData = {
  /** Null for a guest: onboarding never asks for a name. */
  studentName: string | null;
  plan: PlanStep[];
  unfinishedLesson: UnfinishedLesson | null;
  assignments: AssignmentDue[];
  firstStep: FirstStep;
};

/** The motivation numbers the server will count (P2); the device computes the streak today. */
export type MotivationData = {
  points: number;
  minutesToday: number;
  /** The streak that ended, for the "streak stopped" sheet. */
  endedStreak: number;
  restartMinutes: number;
  freezesThisWeek: number;
  /** What today brought, for the "goal done" moment. */
  todayCells: number;
  todayPoints: number;
  todayAccuracy: number;
};

/** A topic that crystallized during a long break. */
export type CrystalTopic = { topicId: string; code: string; title: string };

export type ComebackData = {
  awayDays: number;
  crystals: CrystalTopic[];
  reviewMinutes: number;
};

type InboxBase = { id: string; at: string; read: boolean };

/** One in-app notification; every push also lands here (architecture P1). */
export type InboxItem = InboxBase &
  (
    | { kind: 'answerReady'; questionId: string; teacher: string }
    | {
        kind: 'newAssignment';
        assignmentId: string;
        className: string;
        title: string;
        dueAt: string;
      }
    | { kind: 'reviewDue'; cells: number; minutes: number }
    | { kind: 'streak'; days: number }
    | { kind: 'weeklySummary'; topics: number; accuracy: number }
  );
