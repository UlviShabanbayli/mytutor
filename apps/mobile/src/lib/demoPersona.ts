import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { DemoPersona } from '@mytutor/types';

/**
 * Which demo world the app shows: Nərmin's (the default) or a first-day student's. Kept on the
 * device; every API call sends it (`apiGet(path, { persona })`).
 */
type DemoPersonaState = {
  persona: DemoPersona;
  setPersona: (persona: DemoPersona) => void;
};

export const useDemoPersonaStore = create<DemoPersonaState>()(
  persist(
    (set) => ({
      persona: 'nermin',
      setPersona: (persona) => set({ persona }),
    }),
    { name: 'mytutor-demo-persona', storage: createJSONStorage(() => AsyncStorage) },
  ),
);

/** The current demo persona. */
export const useDemoPersona = () => useDemoPersonaStore((s) => s.persona);
