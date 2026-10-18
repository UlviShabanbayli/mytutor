import { useSyncExternalStore } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { OnboardingProfile, Role } from '@mytutor/types';
import type { AppLocale } from '@/i18n';

type AppState = {
  locale: AppLocale;
  /** The role the interface is built for; null until first launch picks one. */
  role: Role | null;
  /** First launch finished: the app opens on the role's home from now on. */
  onboarded: boolean;
  profile: OnboardingProfile;
  setLocale: (locale: AppLocale) => void;
  setRole: (role: Role) => void;
  updateProfile: (patch: Partial<OnboardingProfile>) => void;
  completeOnboarding: () => void;
  /** Back to first launch (settings "sign out" of a guest, development). */
  resetOnboarding: () => void;
};

const EMPTY_PROFILE: OnboardingProfile = { grade: null, goal: null, dailyMinutes: null };

/**
 * What the device knows before any account exists (architecture: "Vəziyyət, oflayn və real
 * vaxt"). Kept with AsyncStorage; the server becomes the source once an account is made.
 */
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      locale: 'az',
      role: null,
      onboarded: false,
      profile: EMPTY_PROFILE,
      setLocale: (locale) => set({ locale }),
      setRole: (role) => set({ role }),
      updateProfile: (patch) => set((s) => ({ profile: { ...s.profile, ...patch } })),
      completeOnboarding: () => set({ onboarded: true }),
      resetOnboarding: () => set({ role: null, onboarded: false, profile: EMPTY_PROFILE }),
    }),
    {
      name: 'ari-app',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ locale, role, onboarded, profile }) => ({ locale, role, onboarded, profile }),
    },
  ),
);

/** True once the stored state is loaded, so routing never flashes first launch. */
export function useAppHydrated(): boolean {
  return useSyncExternalStore(
    (onChange) => useAppStore.persist.onFinishHydration(onChange),
    () => useAppStore.persist.hasHydrated(),
  );
}
