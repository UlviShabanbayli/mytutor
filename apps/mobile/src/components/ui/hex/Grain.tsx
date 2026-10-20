import { useEffect } from 'react';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Path } from 'react-native-svg';
import { easing } from '@/motion';
import { grainPath } from './geometry';

const AnimatedPath = Animated.createAnimatedComponent(Path);

/** The grain appears in the first 18% of its time, then keeps growing to 4.4×. */
const APPEAR = 0.18;
const GROWN = 4.4;

type GrainProps = {
  cx: number;
  cy: number;
  /** Size of the grain at scale 1. */
  w: number;
  h: number;
  color: string;
  at: number;
  duration: number;
};

/** One crystal grain of hive.crystallize C: pops up small, then grows over the honey. */
export function Grain({ cx, cy, w, h, color, at, duration }: GrainProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  useEffect(() => {
    const first = duration * APPEAR;
    scale.value = withDelay(
      at,
      withSequence(
        withTiming(1, { duration: first, easing: easing.exit }),
        withTiming(GROWN, { duration: duration - first, easing: easing.exit }),
      ),
    );
    opacity.value = withDelay(at, withTiming(1, { duration: first, easing: easing.exit }));
  }, [scale, opacity, at, duration]);
  const props = useAnimatedProps(() => ({
    d: grainPath(cx, cy, w, h, scale.value),
    opacity: opacity.value,
  }));

  return <AnimatedPath fill={color} animatedProps={props} />;
}
