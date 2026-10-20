import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { examStateSchema, leaderboardSchema, mockExamSchema } from '@mytutor/schemas';
import type { DemoPersona, ExamState, StudyGoal } from '@mytutor/types';
import { ApiError, apiGet } from '@/lib/api';
import { useDemoWrite } from '@/lib/demoEvents';
import { useDemoPersona } from '@/lib/demoPersona';
import { joinQueries } from '@/lib/joinQueries';
import { toDeadline, toMockListItem, toScheduledMock } from './fromWorld';
import { examGoalOf, type ExamGoal } from './goal';
import type { LeaderboardScope } from './types';

// The exam area's server state: the demo world's /v1/exam routes through `apiGet` (the API, or
// the same world on the device when it cannot be reached). The goal is the student's own, set
// with the `exam.goalSet` demo event; with the school programme there is no exam data.

export const examKeys = {
  all: ['exam'] as const,
  state: (persona: DemoPersona) => ['exam', persona, 'state'] as const,
  preview: (persona: DemoPersona, goal: ExamGoal | null) =>
    ['exam', persona, 'preview', goal?.exam ?? null, goal?.group ?? null] as const,
  nextMock: (persona: DemoPersona) => ['exam', persona, 'next-mock'] as const,
  mock: (persona: DemoPersona, id: string) => ['exam', persona, 'mocks', id] as const,
  leaderboard: (persona: DemoPersona, scope: LeaderboardScope) =>
    ['exam', persona, 'leaderboard', scope] as const,
};

/** Plan, mocks and dates are kept for offline use: a query runs once even without internet. */
const offline = { networkMode: 'offlineFirst' } as const;

/** `goal=admission&group=II`: the exam as it would be with a goal not saved yet. */
function goalQuery(goal: ExamGoal): string {
  const params = [`goal=${goal.exam}`];
  if (goal.group) params.push(`group=${goal.group}`);
  if (goal.date) params.push(`date=${goal.date}`);
  return params.join('&');
}

function nullOn404(error: unknown): null {
  if (error instanceof ApiError && error.status === 404) return null;
  throw error;
}

function useExamQuery<T>(select: (state: ExamState) => T) {
  const persona = useDemoPersona();
  return useQuery({
    ...offline,
    queryKey: examKeys.state(persona),
    queryFn: () => apiGet('/v1/exam', { persona, parse: examStateSchema.parse }),
    select,
  });
}

function useNextMockQuery() {
  const persona = useDemoPersona();
  return useQuery({
    ...offline,
    queryKey: examKeys.nextMock(persona),
    queryFn: () => apiGet('/v1/exam/next-mock', { persona, parse: mockExamSchema.parse }),
    select: toScheduledMock,
  });
}

const goalOf = (s: ExamState) => ({ goal: examGoalOf(s.goal), daysLeft: s.daysLeft ?? 0 });

/** The student's goal (null for the school programme) and the demo countdown. */
export function useExamGoal() {
  return useExamQuery(goalOf);
}

const homeOf = (s: ExamState) => s;

/** Everything the exam tab shows at once: readiness, today's steps, weak spots, next mock. */
export function useExamHome() {
  return joinQueries(useExamQuery(homeOf), useNextMockQuery(), (exam, nextMock) => ({
    readiness: exam.readiness,
    plan: exam.plan,
    weakSpots: exam.weakSpots,
    nextMock,
  }));
}

const planOf = (s: ExamState) => s.plan;

export function usePlan() {
  return joinQueries(useExamQuery(planOf), useNextMockQuery(), (plan, nextMock) => ({
    plan,
    nextMock,
  }));
}

const weakSpotsOf = (s: ExamState) => s.weakSpots;

export function useWeakSpots() {
  return useExamQuery(weakSpotsOf);
}

const mocksOf = (s: ExamState) => s.mocks.map(toMockListItem);

export function useMocks() {
  return joinQueries(useExamQuery(mocksOf), useNextMockQuery(), (list, scheduled) => ({
    scheduled,
    list,
  }));
}

/** One mock with its questions; null when no mock has this id. */
export function useMock(id: string) {
  const persona = useDemoPersona();
  return useQuery({
    ...offline,
    queryKey: examKeys.mock(persona, id),
    queryFn: () =>
      apiGet(`/v1/exam/mocks/${encodeURIComponent(id)}`, {
        persona,
        parse: mockExamSchema.parse,
      }).catch(nullOn404),
  });
}

/** Where the student's latest mock stands; `board` is null before the first finished mock. */
export function useLeaderboard(scope: LeaderboardScope) {
  const persona = useDemoPersona();
  return useQuery({
    ...offline,
    queryKey: examKeys.leaderboard(persona, scope),
    queryFn: async () => {
      const board = await apiGet(`/v1/exam/leaderboard/${scope}`, {
        persona,
        parse: leaderboardSchema.parse,
      }).catch(nullOn404);
      if (!board) return { board: null, mock: null };
      const mock = await apiGet(`/v1/exam/mocks/${encodeURIComponent(board.mockId)}`, {
        persona,
        parse: mockExamSchema.parse,
      });
      return { board, mock };
    },
  });
}

const deadlinesOf = (s: ExamState) => ({ items: s.deadlines.map(toDeadline), ...goalOf(s) });

/** The calendar with the goal and countdown it speaks of, and the general mock's id. */
export function useDeadlines() {
  return joinQueries(useExamQuery(deadlinesOf), useNextMockQuery(), (exam, next) => ({
    ...exam,
    generalMockId: next.id,
  }));
}

/** The subjects and countdown of a goal being chosen in the setup form, before it is saved. */
export function useExamPreview(goal: ExamGoal | null) {
  const persona = useDemoPersona();
  return useQuery({
    ...offline,
    queryKey: examKeys.preview(persona, goal),
    enabled: goal !== null,
    placeholderData: keepPreviousData,
    queryFn: () =>
      apiGet(`/v1/exam?${goal ? goalQuery(goal) : ''}`, {
        persona,
        parse: examStateSchema.parse,
      }),
    select: (s) => ({ subjects: s.readiness.map((r) => r.subject), daysLeft: s.daysLeft ?? 0 }),
  });
}

/** Saves the student's goal as a demo event; the exam area and every role follow it. */
export function useSetExamGoal(): (goal: StudyGoal) => void {
  const write = useDemoWrite();
  return (goal) => write({ type: 'exam.goalSet', goal });
}
