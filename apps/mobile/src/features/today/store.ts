import { useSyncExternalStore } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { DemoPersona } from '@mytutor/types';
import { daysBetween } from './dates';

type TodayState = {
  /** Day key of the latest visit, to notice a long break. */
  lastVisit: string | null;
  /** Personas who picked "Bilirəm, yoxla" or "Sıfırdan" on the first-day card. */
  firstStepTaken: DemoPersona[];
  /** Records today's visit and returns the whole days since the previous one (0 if none). */
  visit: (today: string) => number;
  takeFirstStep: (persona: DemoPersona) => void;
};

/**
 * What "Bu gün" remembers on the device (architecture: "Vəziyyət, oflayn və real vaxt"): the
 * last visit and the first step, kept with AsyncStorage. Read state of notifications is a demo
 * event (`notification.read`), not kept here.
 */
export const useTodayStore = create<TodayState>()(
  persist(
    (set, get) => ({
      lastVisit: null,
      firstStepTaken: [],
      visit: (today) => {
        const { lastVisit } = get();
        set({ lastVisit: today });
        return lastVisit ? Math.max(0, daysBetween(lastVisit, today)) : 0;
      },
      takeFirstStep: (persona) =>
        set(({ firstStepTaken }) => ({
          firstStepTaken: firstStepTaken.includes(persona)
            ? firstStepTaken
            : [...firstStepTaken, persona],
        })),
    }),
    {
      name: 'ari-today',
      // v2: the first step is per demo persona and read notifications are demo events.
      version: 2,
      migrate: (stored) => {
        const lastVisit =
          stored && typeof stored === 'object' && 'lastVisit' in stored ? stored.lastVisit : null;
        return { lastVisit: typeof lastVisit === 'string' ? lastVisit : null, firstStepTaken: [] };
      },
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ lastVisit, firstStepTaken }) => ({ lastVisit, firstStepTaken }),
    },
  ),
);

/** True once the stored state is loaded, so the first-day screen never flashes. */
export function useTodayHydrated(): boolean {
  return useSyncExternalStore(
    (onChange) => useTodayStore.persist.onFinishHydration(onChange),
    () => useTodayStore.persist.hasHydrated(),
  );
}
