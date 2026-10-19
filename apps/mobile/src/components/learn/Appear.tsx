import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { easing, useReducedMotionPref } from '@/motion';

type Pose = { opacity?: number; y?: number; scale?: number };

type AppearProps = {
  /** Where it starts; it always ends at rest (opacity 1, no offset, scale 1). */
  from: Pose;
  /** An overshoot on the way, reached at `at` (0–1) of the duration: a hop or a bounce. */
  via?: Pose & { at: number };
  delay?: number;
  duration: number;
  ease?: keyof typeof easing;
  /** False shows it at rest at once (e.g. a frame that was open when the screen opened). */
  play?: boolean;
  /** Layout of the wrapper (the animated view inside stretches with it). */
  className?: string;
  children: ReactNode;
};

/**
 * Brings its children in once: a fade, a rise, a pop or a hop, as the hive moments specify.
 * With reduced motion it shows them at rest at once.
 */
export function Appear({
  from,
  via,
  delay = 0,
  duration,
  ease = 'enter',
  play = true,
  className,
  children,
}: AppearProps) {
  const reduced = useReducedMotionPref();
  const still = reduced || !play;
  const opacity = useSharedValue(still ? 1 : (from.opacity ?? 1));
  const y = useSharedValue(still ? 0 : (from.y ?? 0));
  const scale = useSharedValue(still ? 1 : (from.scale ?? 1));

  useEffect(() => {
    if (still) return;
    const curve = easing[ease];
    const go = (rest: number, mid: number | undefined) => {
      if (!via || mid === undefined)
        return withDelay(delay, withTiming(rest, { duration, easing: curve }));
      const first = duration * via.at;
      return withDelay(
        delay,
        withSequence(
          withTiming(mid, { duration: first, easing: curve }),
          withTiming(rest, { duration: duration - first, easing: curve }),
        ),
      );
    };
    const fadeFor = via ? duration * via.at : duration;
    opacity.value = withDelay(delay, withTiming(1, { duration: fadeFor, easing: curve }));
    y.value = go(0, via?.y);
    scale.value = go(1, via?.scale);
    // Plays once on mount; later prop changes do not restart it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: Math.min(1, opacity.value),
    transform: [{ translateY: y.value }, { scale: scale.value }],
  }));

  return (
    <View className={className}>
      <Animated.View style={style}>{children}</Animated.View>
    </View>
  );
}
