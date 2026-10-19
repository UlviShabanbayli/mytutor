import { useEffect } from 'react';
import {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { playCue } from '@/lib/cues';
import { duration, easing, spring, useReducedMotionPref } from '@/motion';

/** The raised face sits on a 4pt edge (`pb-1`) and sinks this far onto it. */
const DEPTH = 4;

type RaisedPressOptions = {
  /** buttons.spot: a slower press and a release without visible bounce. */
  calm: boolean;
  /** Disabled: the face lies flat on its edge in wax colours. */
  off: boolean;
};

/**
 * The raised (edge) buttons' motion:
 * - buttons.primary A: pressIn 80 ms out-quad onto the edge, release with `spring.press`;
 * - buttons.spot A: pressIn 120 ms, release with `spring.calm`;
 * - buttons.enable B: when `off` turns false the colours switch in 120 ms (`litStyle` fades the
 *   face colour in over wax), then the face springs up with `spring.standUp`.
 * Haptic Light (`press`) on pressIn.
 */
export function useRaisedPress({ calm, off }: RaisedPressOptions) {
  const reduced = useReducedMotionPref();
  // 1 = lying on the edge (pressed or disabled), 0 = standing up.
  const sink = useSharedValue(off ? 1 : 0);
  // 0 = disabled wax, 1 = the variant's own colours.
  const lit = useSharedValue(off ? 0 : 1);

  useEffect(() => {
    if (off) {
      lit.set(withTiming(0, { duration: duration.quick }));
      sink.set(withTiming(1, { duration: duration.release, easing: easing.press }));
      return;
    }
    lit.set(withTiming(1, { duration: duration.quick }));
    sink.set(reduced ? 0 : withDelay(duration.standUpDelay, withSpring(0, spring.standUp)));
  }, [off, reduced, lit, sink]);

  const faceStyle = useAnimatedStyle(() => ({ transform: [{ translateY: DEPTH * sink.get() }] }));
  const litStyle = useAnimatedStyle(() => ({ opacity: lit.get() }));

  return {
    faceStyle,
    litStyle,
    pressIn: () => {
      playCue('press');
      sink.set(
        withTiming(1, {
          duration: calm ? duration.quick : duration.press,
          easing: easing.press,
        }),
      );
    },
    pressOut: () => {
      sink.set(withSpring(0, calm ? spring.calm : spring.press));
    },
  };
}
