import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const EXAM_TARGETS = ['unknown', '60', '75', '90'] as const;
export type ExamTarget = (typeof EXAM_TARGETS)[number];

export const EXAM_MINUTES = [20, 40, 60, 90] as const;
export type ExamMinutes = (typeof EXAM_MINUTES)[number];

type ExamPrefsState = {
  /** Target result (optional in the design: "Bilmirəm" is a valid answer). */
  target: ExamTarget;
  minutesPerDay: ExamMinutes;
  /** General mocks the student registered for. */
  registeredMocks: string[];
  /** The leaderboard is opt-in; only the nickname is ever shown. */
  leaderboardOptIn: boolean;
  reminders: boolean;
  /** Weak-spot chains the student sent to the plan with "Bu zənciri düzəlt". */
  chainsInPlan: string[];
  setPlanPrefs: (prefs: { target: ExamTarget; minutesPerDay: ExamMinutes }) => void;
  registerMock: (mockId: string) => void;
  setLeaderboardOptIn: (optIn: boolean) => void;
  setReminders: (on: boolean) => void;
  addChainToPlan: (weakSpotId: string) => void;
};

const addOnce = (list: string[], id: string) => (list.includes(id) ? list : [...list, id]);

/**
 * Exam preferences the profile schema does not hold yet (target, exam minutes), plus demo
 * registrations and the leaderboard choice. Kept on the device until /v1/me/exam-goal exists.
 */
export const useExamStore = create<ExamPrefsState>()(
  persist(
    (set) => ({
      target: '75',
      minutesPerDay: 40,
      registeredMocks: [],
      leaderboardOptIn: false,
      reminders: true,
      chainsInPlan: [],
      setPlanPrefs: ({ target, minutesPerDay }) => set({ target, minutesPerDay }),
      registerMock: (mockId) =>
        set((s) => ({ registeredMocks: addOnce(s.registeredMocks, mockId) })),
      setLeaderboardOptIn: (leaderboardOptIn) => set({ leaderboardOptIn }),
      setReminders: (reminders) => set({ reminders }),
      addChainToPlan: (id) => set((s) => ({ chainsInPlan: addOnce(s.chainsInPlan, id) })),
    }),
    {
      name: 'ari-exam',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({
        target,
        minutesPerDay,
        registeredMocks,
        leaderboardOptIn,
        reminders,
        chainsInPlan,
      }) => ({
        target,
        minutesPerDay,
        registeredMocks,
        leaderboardOptIn,
        reminders,
        chainsInPlan,
      }),
    },
  ),
);
