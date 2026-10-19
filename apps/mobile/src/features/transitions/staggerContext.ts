import { createContext, useContext } from 'react';
import type { SharedValue } from 'react-native-reanimated';

/** A list whose rows come in one after another the first time it shows. */
export type StaggerGroupValue = {
  /** Set once the list has shown: rows mounted later (a new filter) just appear. */
  settled: SharedValue<boolean>;
};

/** One row of such a list: its place, and whether it animates in at all. */
export type StaggerItemValue = { index: number; animate: boolean };

export const StaggerGroupContext = createContext<StaggerGroupValue | null>(null);
export const StaggerItemContext = createContext<StaggerItemValue | null>(null);

export function useStaggerItem(): StaggerItemValue | null {
  return useContext(StaggerItemContext);
}
