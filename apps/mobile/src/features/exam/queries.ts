import { useQuery } from '@tanstack/react-query';
import {
  DEMO_ACCESS,
  demoDeadlines,
  demoLeaderboard,
  demoMock,
  demoMockList,
  demoPlan,
  demoReadiness,
  demoScheduledMock,
  demoWeakSpots,
} from './demo';
import type { ExamGoal } from './goal';
import type { LeaderboardScope } from './types';

// The exam area's server state. Every query serves the demo (src/features/exam/demo.ts) until
// the exam API exists; screens already handle loading, error and empty as they will then.

/** Plan, mocks and dates are kept for offline use: a query runs once even without internet. */
const offline = { networkMode: 'offlineFirst' } as const;

export const examKeys = {
  home: (goal: ExamGoal) => ['exam', 'home', goal.exam, goal.group] as const,
  plan: ['exam', 'plan'] as const,
  weakSpots: ['exam', 'weak-spots'] as const,
  mocks: ['exam', 'mocks'] as const,
  mock: (id: string) => ['exam', 'mocks', id] as const,
  leaderboard: (scope: LeaderboardScope) => ['exam', 'leaderboard', scope] as const,
  deadlines: ['exam', 'deadlines'] as const,
  access: ['exam', 'access'] as const,
};

/** Everything the exam tab shows at once: readiness, today's steps, weak spots, next mock. */
export function useExamHome(goal: ExamGoal) {
  return useQuery({
    ...offline,
    queryKey: examKeys.home(goal),
    queryFn: async () => ({
      readiness: demoReadiness(goal),
      plan: demoPlan(),
      weakSpots: demoWeakSpots(),
      nextMock: demoScheduledMock(new Date()),
    }),
  });
}

export function usePlan() {
  return useQuery({
    ...offline,
    queryKey: examKeys.plan,
    queryFn: async () => ({ plan: demoPlan(), nextMock: demoScheduledMock(new Date()) }),
  });
}

export function useWeakSpots() {
  return useQuery({
    ...offline,
    queryKey: examKeys.weakSpots,
    queryFn: async () => demoWeakSpots(),
  });
}

export function useMocks() {
  return useQuery({
    ...offline,
    queryKey: examKeys.mocks,
    queryFn: async () => {
      const today = new Date();
      return { scheduled: demoScheduledMock(today), list: demoMockList(today) };
    },
  });
}

/** One mock with its questions; null when no mock has this id. */
export function useMock(id: string) {
  return useQuery({ ...offline, queryKey: examKeys.mock(id), queryFn: async () => demoMock(id) });
}

export function useLeaderboard(scope: LeaderboardScope) {
  return useQuery({
    ...offline,
    queryKey: examKeys.leaderboard(scope),
    queryFn: async () => ({
      board: demoLeaderboard(scope),
      mock: demoScheduledMock(new Date()),
    }),
  });
}

export function useDeadlines() {
  return useQuery({
    ...offline,
    queryKey: examKeys.deadlines,
    queryFn: async () => {
      const today = new Date();
      return { items: demoDeadlines(today), generalMockId: demoScheduledMock(today).id };
    },
  });
}

/** What the student's plan unlocks (architecture P4: entitlements are computed on the server). */
export function useExamAccess() {
  return useQuery({ ...offline, queryKey: examKeys.access, queryFn: async () => DEMO_ACCESS });
}
