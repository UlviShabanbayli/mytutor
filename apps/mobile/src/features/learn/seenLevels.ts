import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { MasteryLevel } from './types';

type SeenLevelsState = {
  /** The level each topic cell had when the student last saw it. */
  levels: Record<string, MasteryLevel>;
  see: (topicId: string, level: MasteryLevel) => void;
};

/**
 * What the student has already seen of each cell, so a level change plays once: on the topic
 * page or in the hive box, whichever opens first (hive.fill-nectar, hive.crystallize, …).
 * Motion state only; progress itself comes from the learn store and later the API.
 */
export const useSeenLevels = create<SeenLevelsState>()(
  persist(
    (set) => ({
      levels: {},
      see: (topicId, level) =>
        set((s) =>
          s.levels[topicId] === level ? s : { levels: { ...s.levels, [topicId]: level } },
        ),
    }),
    {
      name: 'ari-learn-seen',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ levels }) => ({ levels }),
    },
  ),
);

/** The level to animate from: what was seen before, if it differs from `level`. */
export function seenChange(
  seen: Record<string, MasteryLevel>,
  topicId: string,
  level: MasteryLevel,
): MasteryLevel | undefined {
  const before = seen[topicId];
  return before !== undefined && before !== level ? before : undefined;
}

/**
 * The level a topic cell should animate from, or undefined. Taken once when the cell
 * appears (and again if the level changes while it is on screen); the new level is then
 * remembered as seen, so the change does not play twice.
 */
export function useLevelChange(topicId: string, level: MasteryLevel): MasteryLevel | undefined {
  const [shown, setShown] = useState(() => ({
    topicId,
    level,
    from: seenChange(useSeenLevels.getState().levels, topicId, level),
  }));
  if (shown.topicId !== topicId || shown.level !== level) {
    const from =
      shown.topicId === topicId
        ? shown.level
        : seenChange(useSeenLevels.getState().levels, topicId, level);
    setShown({ topicId, level, from });
  }
  const see = useSeenLevels((s) => s.see);
  useEffect(() => see(topicId, level), [see, topicId, level]);
  return shown.from;
}
