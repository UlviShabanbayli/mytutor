import { useSyncExternalStore } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { daysBetween } from './dates';

type TodayState = {
  /** Day key of the first visit to "Bu gün": the first-day screen lasts that day. */
  firstDay: string | null;
  /** Day key of the latest visit, to notice a long break. */
  lastVisit: string | null;
  /** The student picked "Bilirəm, yoxla" or "Sıfırdan" on the first-day card. */
  firstStepTaken: boolean;
  /** Notifications read on this device until the inbox API keeps read state (P1). */
  readIds: string[];
  /** Records today's visit and returns the whole days since the previous one (0 if none). */
  visit: (today: string) => number;
  takeFirstStep: () => void;
  markRead: (ids: string[]) => void;
};

/**
 * What "Bu gün" remembers on the device (architecture: "Vəziyyət, oflayn və real vaxt").
 * Kept with AsyncStorage; the server becomes the source once accounts exist.
 */
export const useTodayStore = create<TodayState>()(
  persist(
    (set, get) => ({
      firstDay: null,
      lastVisit: null,
      firstStepTaken: false,
      readIds: [],
      visit: (today) => {
        const { firstDay, lastVisit } = get();
        set({ firstDay: firstDay ?? today, lastVisit: today });
        return lastVisit ? Math.max(0, daysBetween(lastVisit, today)) : 0;
      },
      takeFirstStep: () => set({ firstStepTaken: true }),
      markRead: (ids) => set(({ readIds }) => ({ readIds: [...new Set([...readIds, ...ids])] })),
    }),
    {
      name: 'ari-today',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ firstDay, lastVisit, firstStepTaken, readIds }) => ({
        firstDay,
        lastVisit,
        firstStepTaken,
        readIds,
      }),
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
