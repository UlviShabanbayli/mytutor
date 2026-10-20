import { useEffect, type ReactNode } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { duration as durations, easing, useReducedMotionPref } from '@/motion';

type PopInProps = {
  /** Start of the pop, in ms after mount. */
  delay?: number;
  /** Length of the pop (back-out overshoot). */
  duration?: number;
  /** Scale it pops from: 0 for badges and cells, 0.6–0.8 for pills and tiles. */
  from?: number;
  /** Fade in with the pop (default); false keeps it visible and only pops the scale. */
  fade?: boolean;
  className?: string;
  children: ReactNode;
};

/**
 * Pops its content in with a small overshoot (easing.pop), as the lab's badges, pills, cells and
 * tiles do. Less motion: a 150ms fade, no scaling.
 */
export function PopIn({
  delay = 0,
  duration = durations.fill,
  from = 0,
  fade = true,
  className,
  children,
}: PopInProps) {
  const reduced = useReducedMotionPref();
  const shown = useSharedValue(0);

  useEffect(() => {
    shown.value = reduced
      ? withTiming(1, { duration: durations.reduced })
      : withDelay(delay, withTiming(1, { duration, easing: easing.pop }));
  }, [shown, delay, duration, reduced]);

  const style = useAnimatedStyle(() => ({
    // The overshoot belongs to the scale; opacity is simply on once the pop starts.
    opacity: !fade ? 1 : reduced ? shown.value : Math.min(1, shown.value * 3),
    transform: [{ scale: reduced ? 1 : from + (1 - from) * shown.value }],
  }));

  return (
    // Animated views take no className (NativeWind styles plain views), so layout sits outside.
    <View className={className}>
      <Animated.View style={style}>{children}</Animated.View>
    </View>
  );
}
