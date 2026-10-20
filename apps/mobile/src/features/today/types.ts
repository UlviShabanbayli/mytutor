import type { PlanStep, TodayResponse, UnfinishedLesson } from '@mytutor/types';

// The "Bu gün" area reads the demo world's `GET /v1/today` and `GET /v1/notifications`; the
// shapes are the world's (@mytutor/types), and the types here are what the screens build on them.

export type {
  AssignmentDue,
  Comeback as ComebackData,
  CrystalTopic,
  FirstStep,
  PlanStep,
  PlanStepReason as StepReason,
  UnfinishedLesson,
} from '@mytutor/types';

/** GET /v1/today. */
export type TodayData = TodayResponse;

/** Where a plan step leads: lessons, tests, review, topics, assignments and mocks. */
export type StepKind = PlanStep['kind'];

/** Parts of a lesson (architecture Ş4: text, video, worked examples, exercises). */
export type LessonPart = UnfinishedLesson['part'];

/** The motivation numbers of the day, from the world's `motivation` (architecture P2). */
export type MotivationData = {
  /** All the honey drops ("bal") the student has. */
  points: number;
  /** Days in a row with the daily goal met, up to yesterday. */
  streak: number;
  /** The goal the world's student set (the device's own choice comes first). */
  dailyMinutes: number;
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

type InboxBase = { id: string; at: string; read: boolean };

/** One in-app notification as the inbox shows it; every push also lands here (P1). */
export type InboxItem = InboxBase &
  (
    | { kind: 'answerReady'; questionId: string; teacher: string | null }
    | {
        kind: 'newAssignment';
        assignmentId: string;
        className: string;
        title: string;
        dueAt: string;
      }
    | {
        kind: 'assignmentGraded';
        assignmentId: string;
        title: string;
        teacher: string | null;
        score: number;
        outOf: number;
      }
    | { kind: 'reviewDue'; cells: number; minutes: number }
    | { kind: 'streak'; days: number }
    | { kind: 'weeklySummary'; topics: number; accuracy: number }
  );
