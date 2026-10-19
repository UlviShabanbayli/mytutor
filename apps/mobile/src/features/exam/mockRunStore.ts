import { useSyncExternalStore } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { OptionKey } from '@mytutor/types';

export type MockAttempt = {
  mockId: string;
  /** Epoch ms of "Başla": the timer counts from here. */
  startedAt: number;
  answers: Record<string, OptionKey>;
  flagged: string[];
  index: number;
  finishedAt: number | null;
  /** The time ran out before the student finished. */
  timedOut: boolean;
  /** Score in percent, stored when the attempt is finished. */
  percent: number | null;
};

type MockRunState = {
  /** The latest attempt per mock. */
  attempts: Record<string, MockAttempt>;
  /** Starts a new attempt, or keeps the running one. */
  start: (mockId: string, now: number) => void;
  select: (mockId: string, questionId: string, key: OptionKey) => void;
  toggleFlag: (mockId: string, questionId: string) => void;
  goTo: (mockId: string, index: number) => void;
  finish: (mockId: string, finishedAt: number, percent: number, timedOut: boolean) => void;
};

/** Applies `change` to a running attempt only: answers never change after "Bitir". */
const running = (
  attempts: Record<string, MockAttempt>,
  mockId: string,
  change: (a: MockAttempt) => Partial<MockAttempt>,
) => {
  const attempt = attempts[mockId];
  if (!attempt || attempt.finishedAt !== null) return {};
  return { attempts: { ...attempts, [mockId]: { ...attempt, ...change(attempt) } } };
};

/**
 * Mock attempts, kept on the device so a running timer and every answer survive leaving the
 * app ("Hər cavab dərhal yadda saxlanır"). Moves to /v1/mock-exams/:id/attempts with the API.
 */
export const useMockRunStore = create<MockRunState>()(
  persist(
    (set) => ({
      attempts: {},
      start: (mockId, now) =>
        set(({ attempts }) => {
          const current = attempts[mockId];
          if (current && current.finishedAt === null) return {};
          const fresh: MockAttempt = {
            mockId,
            startedAt: now,
            answers: {},
            flagged: [],
            index: 0,
            finishedAt: null,
            timedOut: false,
            percent: null,
          };
          return { attempts: { ...attempts, [mockId]: fresh } };
        }),
      select: (mockId, questionId, key) =>
        set(({ attempts }) =>
          running(attempts, mockId, (a) => ({ answers: { ...a.answers, [questionId]: key } })),
        ),
      toggleFlag: (mockId, questionId) =>
        set(({ attempts }) =>
          running(attempts, mockId, (a) => ({
            flagged: a.flagged.includes(questionId)
              ? a.flagged.filter((id) => id !== questionId)
              : [...a.flagged, questionId],
          })),
        ),
      goTo: (mockId, index) => set(({ attempts }) => running(attempts, mockId, () => ({ index }))),
      finish: (mockId, finishedAt, percent, timedOut) =>
        set(({ attempts }) => running(attempts, mockId, () => ({ finishedAt, percent, timedOut }))),
    }),
    {
      name: 'ari-mock-runs',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ attempts }) => ({ attempts }),
    },
  ),
);

/** True once stored attempts are loaded, so a running mock is never restarted by mistake. */
export function useMockRunHydrated(): boolean {
  return useSyncExternalStore(
    (onChange) => useMockRunStore.persist.onFinishHydration(onChange),
    () => useMockRunStore.persist.hasHydrated(),
  );
}
