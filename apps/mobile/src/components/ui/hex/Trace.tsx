import { useEffect } from 'react';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { Polygon } from 'react-native-svg';
import { easing } from '@/motion';

const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);

type TraceProps = {
  points: string;
  /** Outline length: the dash that is drawn. */
  length: number;
  color: string;
  width: number;
  /** Start and duration of the drawing, then of the fade that follows it (ms). */
  drawAt: number;
  drawFor: number;
  outAt: number;
  outFor: number;
};

/** An outline drawn around its corners like a bee building wax, then faded out (hive.seal C). */
export function Trace(props: TraceProps) {
  const { points, length, color, width, drawAt, drawFor, outAt, outFor } = props;
  const offset = useSharedValue(length);
  const opacity = useSharedValue(1);
  useEffect(() => {
    offset.value = withDelay(drawAt, withTiming(0, { duration: drawFor, easing: easing.trace }));
    opacity.value = withDelay(outAt, withTiming(0, { duration: outFor }));
  }, [offset, opacity, drawAt, drawFor, outAt, outFor]);
  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: offset.value,
    opacity: opacity.value,
  }));

  return (
    <AnimatedPolygon
      points={points}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinejoin="round"
      strokeDasharray={[length, length]}
      animatedProps={animatedProps}
    />
  );
}
