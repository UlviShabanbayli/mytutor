import { useCallback, useMemo, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import type { StepTrack } from '@/features/onboarding/types';
import { duration, easing, useReducedMotionPref } from '@/motion';
import { lastStep, planEntry, rememberStep } from './stepEntry';
import type { StepMotion } from './stepMotion';

/** transitions.onboarding A: the question comes in from 40pt to the side. */
const SLIDE = 40;

/**
 * Slides a step screen's question in when it is shown: from the right on a step forward,
 * from the left when the student comes back to it. The stack itself does not animate between
 * steps, so the frame (back button, dashes, footer) stays put. Less motion: no slide.
 */
export function useStepEntrance(track: StepTrack | undefined, step: number | undefined) {
  const reduced = useReducedMotionPref();
  const place = track && step ? { track, step } : null;
  const [first] = useState(() => planEntry(place, lastStep(), false));
  const sliding = first.dir !== 0 && !reduced;
  const x = useSharedValue(sliding ? SLIDE * first.dir : 0);
  const opacity = useSharedValue(sliding ? 0 : 1);
  const from = useSharedValue(sliding ? (first.from ?? -1) : -1);
  const entrance = useSharedValue(0);
  const shown = useRef(false);

  useFocusEffect(
    useCallback(() => {
      const here = track && step ? { track, step } : null;
      const entry = planEntry(here, lastStep(), shown.current);
      shown.current = true;
      rememberStep(here);
      if (reduced || entry.dir === 0) return;
      const config = { duration: duration.step, easing: easing.enter };
      x.set(SLIDE * entry.dir);
      opacity.set(0);
      x.set(withTiming(0, config));
      opacity.set(withTiming(1, config));
      from.set(entry.from ?? -1);
      entrance.set(entrance.get() + 1);
    }, [track, step, reduced, x, opacity, from, entrance]),
  );

  const contentStyle = useAnimatedStyle(() => ({
    opacity: opacity.get(),
    transform: [{ translateX: x.get() }],
  }));
  const motion = useMemo<StepMotion>(() => ({ x, from, entrance }), [x, from, entrance]);
  return { motion, contentStyle };
}
