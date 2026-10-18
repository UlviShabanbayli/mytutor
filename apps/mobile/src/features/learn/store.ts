import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { HiveState } from './mastery';
import type { PlacementAnswer, PlacementOutcome } from './types';

const MAX_RECENT = 3;

type PlacementRecord = { status: 'done' | 'skipped'; outcome?: PlacementOutcome };

type LearnState = {
  /** Textbook the student said their school uses, per hive; `unknown` is "Bilmirəm". */
  textbooks: Record<string, string>;
  placement: Record<string, PlacementRecord>;
  /** What this device adds to each hive: levels from checks, current topic, saved topics. */
  hives: Record<string, HiveState>;
  /** Grades whose content the student wants to hear about. */
  notifyGrades: number[];
  recentSearches: string[] | null;
  pickTextbook: (hiveId: string, textbookId: string) => void;
  skipPlacement: (hiveId: string) => void;
  finishPlacement: (hiveId: string, outcome: PlacementOutcome) => void;
  saveTopics: (hiveId: string, topicIds: string[]) => void;
  toggleNotify: (grade: number) => void;
  addRecentSearch: (query: string) => void;
};

const emptyHive: HiveState = { levels: {}, savedTopicIds: [] };

/**
 * The learn area's device state until the progress API exists (architecture "Vəziyyət, oflayn
 * və real vaxt"): kept with AsyncStorage, replaced by /v1/me/progress and /v1/me/placement.
 */
export const useLearnStore = create<LearnState>()(
  persist(
    (set) => ({
      textbooks: {},
      placement: {},
      hives: {},
      notifyGrades: [],
      recentSearches: null,
      pickTextbook: (hiveId, textbookId) =>
        set((s) => ({ textbooks: { ...s.textbooks, [hiveId]: textbookId } })),
      skipPlacement: (hiveId) =>
        set((s) => ({ placement: { ...s.placement, [hiveId]: { status: 'skipped' } } })),
      finishPlacement: (hiveId, outcome) =>
        set((s) => {
          const hive = s.hives[hiveId] ?? emptyHive;
          const levels = { ...hive.levels };
          for (const id of outcome.knownTopicIds) levels[id] = 'mastered';
          return {
            placement: { ...s.placement, [hiveId]: { status: 'done', outcome } },
            hives: {
              ...s.hives,
              [hiveId]: { ...hive, levels, currentTopicId: outcome.startTopicId ?? undefined },
            },
          };
        }),
      saveTopics: (hiveId, topicIds) =>
        set((s) => {
          const hive = s.hives[hiveId] ?? emptyHive;
          const savedTopicIds = [...new Set([...hive.savedTopicIds, ...topicIds])];
          return { hives: { ...s.hives, [hiveId]: { ...hive, savedTopicIds } } };
        }),
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
          const rest = (s.recentSearches ?? []).filter((r) => r !== q);
          return { recentSearches: [q, ...rest].slice(0, MAX_RECENT) };
        }),
    }),
    {
      name: 'ari-learn',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ textbooks, placement, hives, notifyGrades, recentSearches }) => ({
        textbooks,
        placement,
        hives,
        notifyGrades,
        recentSearches,
      }),
    },
  ),
);

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
