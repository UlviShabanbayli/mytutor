import type {
  Deadline as DeadlineData,
  ExamPlanDay,
  ExamPlanStep,
  Leaderboard,
  MockExam,
  MockListItem as MockListItemData,
  WeakSpot,
} from '@mytutor/types';

/*
 * The exam area reads the demo world's shapes (packages/schemas/src/domain/exam*.ts). Dates the
 * calendar helpers work with arrive as ISO strings and become `Date`s in `fromWorld.ts`.
 */

export type {
  ChainLink,
  ExamPlan,
  ExamState,
  ExamSubject,
  Leaderboard,
  LeaderboardEntry,
  MockExam,
  MockGroup,
  MockQuestion,
  SubjectReadiness,
  WeakSpot,
  WeakSpotsReport,
} from '@mytutor/types';

export type PlanStep = ExamPlanStep;
export type PlanDay = ExamPlanDay;
export type StepKind = PlanStep['kind'];
export type StepState = PlanStep['state'];
export type StepReason = PlanStep['reason'];
/** Where a plan step leads: the work itself, opened with one tap. */
export type StepTarget = PlanStep['target'];
export type DayMark = PlanDay['marks'][number];
export type Evidence = WeakSpot['evidence'];
export type MockKind = MockExam['kind'];
export type LeaderboardScope = Leaderboard['scope'];

/** The scheduled general mock with its dates. */
export type ScheduledMock = Pick<MockExam, 'id' | 'subject' | 'number'> & {
  startsAt: Date;
  registrationEndsAt: Date;
};

/** A row of the mocks list; a finished variant's last date as a `Date`. */
export type MockListItem =
  | Extract<MockListItemData, { preparing: true }>
  | (Omit<Extract<MockListItemData, { preparing: false }>, 'lastDate'> & { lastDate: Date | null });

/** A calendar entry; a dated one's date as a `Date`. */
export type Deadline = DeadlineData extends infer D
  ? D extends { date: string }
    ? Omit<D, 'date'> & { date: Date }
    : D
  : never;
