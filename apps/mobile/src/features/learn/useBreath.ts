import { useEffect } from 'react';
import {
  cancelAnimation,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { easing, useReducedMotionPref } from '@/motion';
import { currentPulse } from './hiveMotion';

/**
 * hive.current-pulse A: 0 → 1 → 0 three times after the cell appears, then still (0).
 * Nothing moves with reduced motion.
 */
export function useBreath(active: boolean) {
  const reduced = useReducedMotionPref();
  const breath = useSharedValue(0);
  useEffect(() => {
    if (!active || reduced) {
      cancelAnimation(breath);
      breath.value = 0;
      return;
    }
    breath.value = withDelay(
      currentPulse.delay,
      withRepeat(
        withTiming(1, { duration: currentPulse.half, easing: easing.breathe }),
        currentPulse.halves,
        true,
      ),
    );
    return () => cancelAnimation(breath);
  }, [active, reduced, breath]);
  return breath;
}
