import type { ReactNode } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { playCue } from '@/lib/cues';
import { duration, easing, spring, useReducedMotionPref } from '@/motion';

type PressableCellProps = {
  accessibilityLabel: string;
  onPress: () => void;
  children: ReactNode;
};

/** hive.cell-tap B · Yaylı: the cell sinks 3pt to 0.92 and springs back past 1.06. */
const PRESSED = { y: 3, scale: 0.92 };
const RELEASE_PEAK = 1.06;
/** The release reaches its peak at 45% of its 420ms. */
const RELEASE_PEAK_MS = 190;

/** A tappable cell in the comb: presses like honeycomb wax and taps lightly. */
export function PressableCell({ accessibilityLabel, onPress, children }: PressableCellProps) {
  const reduced = useReducedMotionPref();
  const y = useSharedValue(0);
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }, { scale: scale.value }],
  }));

  const pressIn = () => {
    playCue('press');
    if (reduced) return;
    const timing = { duration: duration.quick, easing: easing.enter };
    y.set(withTiming(PRESSED.y, timing));
    scale.set(withTiming(PRESSED.scale, timing));
  };
  const pressOut = () => {
    if (reduced) return;
    y.set(withSpring(0, spring.cell));
    scale.set(
      withSequence(
        withTiming(RELEASE_PEAK, { duration: RELEASE_PEAK_MS, easing: easing.press }),
        withSpring(1, spring.cell),
      ),
    );
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
    >
      <Animated.View style={style}>{children}</Animated.View>
    </Pressable>
  );
}
