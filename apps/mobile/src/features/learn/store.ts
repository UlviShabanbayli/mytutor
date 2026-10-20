import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { DemoPersona } from '@mytutor/types';
import { registerDemoReset } from '@/lib/demoEvents';
import { useDemoPersona, useDemoPersonaStore } from '@/lib/demoPersona';
import type { HiveState } from './mastery';
import type { PlacementAnswer, PlacementOutcome } from './types';

const MAX_RECENT = 3;

type PlacementRecord = { status: 'done' | 'skipped'; outcome?: PlacementOutcome };

/** What one student did on this device in the learn area, on top of the demo world. */
export type LearnData = {
  /** Textbook the student said their school uses, per hive; `unknown` is "Bilmirəm". */
  textbooks: Record<string, string>;
  placement: Record<string, PlacementRecord>;
  /** What this device adds to each hive: levels from checks, current topic, saved topics. */
  hives: Record<string, HiveState>;
};

type LearnState = {
  /** Each demo persona is its own student: Nərmin's device state never shows for "Yeni şagird". */
  byPersona: Partial<Record<DemoPersona, LearnData>>;
  /** Grades whose content the student wants to hear about. */
  notifyGrades: number[];
  recentSearches: string[];
  pickTextbook: (hiveId: string, textbookId: string) => void;
  skipPlacement: (hiveId: string) => void;
  finishPlacement: (hiveId: string, outcome: PlacementOutcome) => void;
  saveTopics: (hiveId: string, topicIds: string[]) => void;
  toggleNotify: (grade: number) => void;
  addRecentSearch: (query: string) => void;
};

const EMPTY: LearnData = { textbooks: {}, placement: {}, hives: {} };
const emptyHive: HiveState = { levels: {}, savedTopicIds: [] };

/** The current persona's learn data, changed by `change`. */
function update(
  state: LearnState,
  change: (data: LearnData) => Partial<LearnData>,
): Pick<LearnState, 'byPersona'> {
  const persona = useDemoPersonaStore.getState().persona;
  const data = state.byPersona[persona] ?? EMPTY;
  return { byPersona: { ...state.byPersona, [persona]: { ...data, ...change(data) } } };
}

/**
 * The learn area's device state (architecture "Vəziyyət, oflayn və real vaxt"): the textbook
 * choice, the placement check, its levels and downloads. The demo events have no learning
 * events, so it stays on the device, kept per persona with AsyncStorage.
 */
export const useLearnStore = create<LearnState>()(
  persist(
    (set) => ({
      byPersona: {},
      notifyGrades: [],
      recentSearches: [],
      pickTextbook: (hiveId, textbookId) =>
        set((s) => update(s, (d) => ({ textbooks: { ...d.textbooks, [hiveId]: textbookId } }))),
      skipPlacement: (hiveId) =>
        set((s) =>
          update(s, (d) => ({ placement: { ...d.placement, [hiveId]: { status: 'skipped' } } })),
        ),
      finishPlacement: (hiveId, outcome) =>
        set((s) =>
          update(s, (d) => {
            const hive = d.hives[hiveId] ?? emptyHive;
            const levels = { ...hive.levels };
            for (const id of outcome.knownTopicIds) levels[id] = 'mastered';
            return {
              placement: { ...d.placement, [hiveId]: { status: 'done', outcome } },
              hives: {
                ...d.hives,
                [hiveId]: { ...hive, levels, currentTopicId: outcome.startTopicId ?? undefined },
              },
            };
          }),
        ),
      saveTopics: (hiveId, topicIds) =>
        set((s) =>
          update(s, (d) => {
            const hive = d.hives[hiveId] ?? emptyHive;
            const savedTopicIds = [...new Set([...hive.savedTopicIds, ...topicIds])];
            return { hives: { ...d.hives, [hiveId]: { ...hive, savedTopicIds } } };
          }),
        ),
      toggleNotify: (grade) =>
        set((s) => ({
          notifyGrades: s.notifyGrades.includes(grade)
            ? s.notifyGrades.filter((g) => g !== grade)
            : [...s.notifyGrades, grade],
        })),
      addRecentSearch: (query) =>
        set((s) => {
          const q = query.trim();
          if (!q) return {};
          const rest = s.recentSearches.filter((r) => r !== q);
          return { recentSearches: [q, ...rest].slice(0, MAX_RECENT) };
        }),
    }),
    {
      name: 'ari-learn',
      // v2: the device state is kept per demo persona; v1 had one student's state.
      version: 2,
      migrate: () => ({ byPersona: {}, notifyGrades: [], recentSearches: [] }),
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ byPersona, notifyGrades, recentSearches }) => ({
        byPersona,
        notifyGrades,
        recentSearches,
      }),
    },
  ),
);

// "Demo məlumatını sıfırla": the persona starts over (textbook, placement, levels, downloads).
registerDemoReset((persona) =>
  useLearnStore.setState((s) => {
    const byPersona = { ...s.byPersona };
    delete byPersona[persona];
    return { byPersona, recentSearches: [] };
  }),
);

/** A piece of the current persona's learn data. */
export function useLearnData<T>(select: (data: LearnData) => T): T {
  const persona = useDemoPersona();
  return useLearnStore((s) => select(s.byPersona[persona] ?? EMPTY));
}

/** The current persona's learn data, outside React. */
export const learnDataNow = (): LearnData =>
  useLearnStore.getState().byPersona[useDemoPersonaStore.getState().persona] ?? EMPTY;

type PlacementSession = {
  hiveId: string | null;
  answers: PlacementAnswer[];
  begin: (hiveId: string) => void;
  answer: (questionId: string, choice: number | null) => void;
};

/** The running placement check; kept in memory only (leaving it starts over next time). */
export const usePlacementSession = create<PlacementSession>((set) => ({
  hiveId: null,
  answers: [],
  begin: (hiveId) => set({ hiveId, answers: [] }),
  answer: (questionId, choice) =>
    set((s) => ({
      answers: [...s.answers.filter((a) => a.questionId !== questionId), { questionId, choice }],
    })),
}));
