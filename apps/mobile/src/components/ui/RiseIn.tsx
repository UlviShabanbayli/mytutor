import { type ReactNode, useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { duration as durations, easing, useReducedMotionPref } from '@/motion';

type RiseInProps = {
  /** Start offset in points: positive rises from below, negative drops from above. */
  from: number;
  delay?: number;
  duration?: number;
  /** Classes of the content's View; the animated layer around it carries only style. */
  className?: string;
  children: ReactNode;
};

/**
 * Fades its content in while it travels `from` points into place, once, on mount. Used where
 * Reanimated's `entering` with custom initial values misbehaves on the web (the element is
 * left absolutely positioned after the animation, so it overlaps what follows).
 */
export function RiseIn({
  from,
  delay = 0,
  duration = durations.base,
  className,
  children,
}: RiseInProps) {
  const reduced = useReducedMotionPref();
  const p = useSharedValue(0);

  useEffect(() => {
    p.value = reduced
      ? withTiming(1, { duration: durations.reduced })
      : withDelay(delay, withTiming(1, { duration, easing: easing.enter }));
  }, [reduced, delay, duration, p]);

  const style = useAnimatedStyle(() => ({
    opacity: p.value,
    transform: [{ translateY: reduced ? 0 : (1 - p.value) * from }],
  }));

  return (
    <Animated.View style={style}>
      <View className={className}>{children}</View>
    </Animated.View>
  );
}
