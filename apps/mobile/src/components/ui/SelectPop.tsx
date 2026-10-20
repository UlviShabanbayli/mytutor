import { type ReactNode, useEffect, useRef } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { duration, easing, spring, useReducedMotionPref } from '@/motion';

/** How far the chosen cell swells before it springs back. */
const PEAK = 1.12;

type SelectPopProps = {
  selected: boolean;
  children: ReactNode;
};

/**
 * buttons.grade B for grade and number pickers: when its cell becomes the chosen one it swells
 * to 1.12 in 90 ms and springs back (`spring.pop`), raised above its neighbours meanwhile.
 * Wrap the cell (the pressable or its face); the caller plays the `select` cue on choosing.
 */
export function SelectPop({ selected, children }: SelectPopProps) {
  const reduced = useReducedMotionPref();
  const scale = useSharedValue(1);
  const was = useRef(selected);

  useEffect(() => {
    if (selected && !was.current && !reduced) {
      scale.set(
        withSequence(
          withTiming(PEAK, { duration: duration.pop, easing: easing.press }),
          withSpring(1, spring.pop),
        ),
      );
    }
    was.current = selected;
  }, [selected, reduced, scale]);

  const style = useAnimatedStyle(() => ({
    zIndex: scale.get() > 1.001 ? 1 : 0,
    transform: [{ scale: scale.get() }],
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
}
