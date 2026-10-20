import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Polygon } from 'react-native-svg';
import { duration, useReducedMotionPref } from '@/motion';
import { useThemeColors, type ColorName } from '@/theme';
import { busyCellFrame } from './busyCellFrame';

const W = 14;
const H = 16;
/** A pointy-top hexagon in the 14×16 cell. */
const HEX = `${W / 2},0 ${W},${H / 4} ${W},${(H * 3) / 4} ${W / 2},${H} 0,${(H * 3) / 4} 0,${H / 4}`;

type BusyCellProps = {
  /** Its place in the row; each cell starts `duration.busyStagger` after the previous one. */
  index: number;
  color: ColorName;
};

/**
 * One cell of the busy state (buttons.loading C): a faint hexagon that fills with `color`
 * bottom→top, holds and fades, looping. With reduced motion it stays full and still.
 */
export function BusyCell({ index, color }: BusyCellProps) {
  const c = useThemeColors();
  const reduced = useReducedMotionPref();
  const phase = useSharedValue(reduced ? 0.5 : 0);

  useEffect(() => {
    if (reduced) {
      cancelAnimation(phase);
      phase.set(0.5);
      return;
    }
    phase.set(0);
    phase.set(
      withDelay(
        index * duration.busyStagger,
        withRepeat(withTiming(1, { duration: duration.busyLoop, easing: Easing.linear }), -1),
      ),
    );
    return () => cancelAnimation(phase);
  }, [index, reduced, phase]);

  // A window that rises from the bottom (and fades), and the full hexagon held still inside it.
  const windowStyle = useAnimatedStyle(() => {
    const f = busyCellFrame(phase.get());
    return { opacity: f.opacity, transform: [{ translateY: H * (1 - f.fill) }] };
  });
  const holdStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -H * (1 - busyCellFrame(phase.get()).fill) }],
  }));

  return (
    <View className="h-4 w-3.5">
      <Svg width={W} height={H}>
        <Polygon points={HEX} fill={c[color]} opacity={0.22} />
      </Svg>
      <Animated.View style={[StyleSheet.absoluteFill, windowStyle]}>
        <View className="absolute left-0 top-0 h-4 w-3.5 overflow-hidden">
          <Animated.View style={holdStyle}>
            <Svg width={W} height={H}>
              <Polygon points={HEX} fill={c[color]} />
            </Svg>
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
}
