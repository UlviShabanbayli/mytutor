import type { ReactNode } from 'react';
import { useEffect } from 'react';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { G } from 'react-native-svg';

const AnimatedG = Animated.createAnimatedComponent(G);

type FadeProps = {
  /** When the fade starts and how long it takes, in ms after mount. */
  at: number;
  duration: number;
  from?: number;
  to?: number;
  children: ReactNode;
};

/** A group of SVG shapes whose opacity goes from `from` to `to` once. */
export function Fade({ at, duration, from = 0, to = 1, children }: FadeProps) {
  const opacity = useSharedValue(from);
  useEffect(() => {
    opacity.value = withDelay(at, withTiming(to, { duration }));
  }, [opacity, at, duration, to]);
  const props = useAnimatedProps(() => ({ opacity: opacity.value }));
  return <AnimatedG animatedProps={props}>{children}</AnimatedG>;
}
