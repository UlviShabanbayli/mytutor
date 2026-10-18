import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DEFAULT_REMINDER_TIME, type ReminderTime } from './reminder';
import type { GoalChoice, TeacherDraft } from './types';

/** The answer to "Sabah xatırladım?": not asked yet, yes, or no. */
export type ReminderConsent = 'unasked' | 'on' | 'off';

type OnboardingState = {
  /** The goal screen's answer ("Hələ bilmirəm" leaves the profile's goal empty). */
  goalChoice: GoalChoice | null;
  /** Optional exam target, percent of correct answers. Proposal: a field of StudyGoal. */
  examTarget: number | null;
  reminderTime: ReminderTime;
  reminders: ReminderConsent;
  teacher: TeacherDraft;
  setGoalChoice: (choice: GoalChoice) => void;
  setExamTarget: (target: number | null) => void;
  setReminderTime: (time: ReminderTime) => void;
  setReminders: (consent: ReminderConsent) => void;
  setTeacher: (draft: TeacherDraft) => void;
};

/**
 * First-launch answers that the shared `OnboardingProfile` has no field for yet. Kept on the
 * device until the profile and notification APIs exist (architecture Ş1, P1, M1).
 */
export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      goalChoice: null,
      examTarget: null,
      reminderTime: DEFAULT_REMINDER_TIME,
      reminders: 'unasked',
      teacher: { subjects: [], grades: [], bio: '' },
      setGoalChoice: (goalChoice) => set({ goalChoice }),
      setExamTarget: (examTarget) => set({ examTarget }),
      setReminderTime: (reminderTime) => set({ reminderTime }),
      setReminders: (reminders) => set({ reminders }),
      setTeacher: (teacher) => set({ teacher }),
    }),
    {
      name: 'ari-onboarding',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ goalChoice, examTarget, reminderTime, reminders, teacher }) => ({
        goalChoice,
        examTarget,
        reminderTime,
        reminders,
        teacher,
      }),
    },
  ),
);

/** True until the student answered the reminder question (asked after the first lesson). */
export function useShouldAskReminders(): boolean {
  return useOnboardingStore((s) => s.reminders === 'unasked');
}
