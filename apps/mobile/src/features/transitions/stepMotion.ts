import { createContext, useContext } from 'react';
import type { SharedValue } from 'react-native-reanimated';

/** Shared by a step screen with its dashes and with what must stay put while it slides. */
export type StepMotion = {
  /** How far the step's content is from its place (pt); `StepStill` cancels it. */
  x: SharedValue<number>;
  /** The step the dashes stretch from (-1: none) and a counter that restarts them. */
  from: SharedValue<number>;
  entrance: SharedValue<number>;
};

export const StepMotionContext = createContext<StepMotion | null>(null);

export function useStepMotion(): StepMotion | null {
  return useContext(StepMotionContext);
}
