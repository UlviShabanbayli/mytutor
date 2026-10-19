import { useEffect } from 'react';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { G, Rect } from 'react-native-svg';
import { easing } from '@/motion';
import type { CellGeometry } from './geometry';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

type LiquidProps = {
  geo: CellGeometry;
  color: string;
  /** Surface height (y) before and after the rise. */
  fromTop: number;
  toTop: number;
  at: number;
  duration: number;
};

/** Liquid rising inside the cell: the surface moves from `fromTop` up to `toTop`. */
export function Liquid({ geo, color, fromTop, toTop, at, duration }: LiquidProps) {
  const top = useSharedValue(fromTop);
  useEffect(() => {
    top.value = withDelay(at, withTiming(toTop, { duration, easing: easing.fill }));
  }, [top, at, duration, toTop]);
  const props = useAnimatedProps(() => ({ y: top.value, height: geo.h - top.value }));

  return (
    <G clipPath={`url(#${geo.clipId})`}>
      <AnimatedRect x={0} width={geo.w} fill={color} animatedProps={props} />
    </G>
  );
}
