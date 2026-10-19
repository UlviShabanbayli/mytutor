import { useRef } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import {
  FadeOut,
  Keyframe,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { duration, easing, spring, useReducedMotionPref } from '@/motion';

/** transitions.toast B: a leaving banner goes up 24pt as it fades. */
const LEAVE_RISE = 24;

const leave = new Keyframe({
  0: { opacity: 1, transform: [{ translateY: 0 }] },
  100: { opacity: 0, transform: [{ translateY: -LEAVE_RISE }], easing: easing.away },
}).duration(duration.leave);

/**
 * transitions.toast B: a banner drops in from under what is above it while its slot opens
 * (spring damping 20, stiffness 240), so the content below moves down with it; it leaves in
 * 180ms. With less motion it only fades (150ms).
 */
export function useBannerDrop() {
  const reduced = useReducedMotionPref();
  const height = useSharedValue(0);
  const open = useSharedValue(reduced ? 1 : 0);
  const shown = useSharedValue(reduced ? 0 : 1);
  const started = useRef(false);

  const onBannerLayout = (e: LayoutChangeEvent) => {
    height.set(e.nativeEvent.layout.height);
    if (started.current) return;
    started.current = true;
    if (reduced) shown.set(withTiming(1, { duration: duration.reduced }));
    else open.set(withSpring(1, spring.banner));
  };

  // The slot spans the width it is given, as a banner did before it moved.
  const slotStyle = useAnimatedStyle(() => ({
    alignSelf: 'stretch',
    height: height.get() * open.get(),
    overflow: 'hidden',
    opacity: shown.get(),
  }));
  const dropStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -height.get() * (1 - open.get()) }],
  }));

  return {
    slotStyle,
    dropStyle,
    onBannerLayout,
    exiting: reduced ? FadeOut.duration(duration.reduced) : leave,
  };
}
