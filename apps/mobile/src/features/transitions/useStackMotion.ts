import { duration, useReducedMotionPref } from '@/motion';

/**
 * transitions.push A: a pushed screen slides in from the right over the list, and a swipe
 * from anywhere on the screen takes the student back (release past 40% or a quick flick).
 * The native stack draws it on iOS and Android alike; with less motion it is a 150ms fade.
 * The web has no stack animation, so there the screens simply switch.
 */
export function useStackMotion() {
  const reduced = useReducedMotionPref();
  return {
    headerShown: false,
    gestureEnabled: true,
    fullScreenGestureEnabled: true,
    ...(reduced
      ? { animation: 'fade' as const, animationDuration: duration.reduced }
      : { animation: 'ios_from_right' as const }),
  };
}
