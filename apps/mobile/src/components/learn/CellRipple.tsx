import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Polygon } from 'react-native-svg';
import { easing, useReducedMotionPref } from '@/motion';
import { useThemeColors } from '@/theme';
import { hexPolygon } from './FlatHex';

type CellRippleProps = {
  /** The cell's box. */
  size: number;
  height: number;
  at: number;
  duration: number;
  times: number;
  children: ReactNode;
};

/** A honey hexagon that swells out from behind a cell and fades: "start here" (placement). */
export function CellRipple({ size, height, at, duration, times, children }: CellRippleProps) {
  const c = useThemeColors();
  const reduced = useReducedMotionPref();
  const wave = useSharedValue(0);
  useEffect(() => {
    if (reduced) return;
    wave.value = withDelay(
      at,
      withRepeat(
        withSequence(
          withTiming(0, { duration: 0 }),
          withTiming(1, { duration, easing: easing.enter }),
        ),
        times,
      ),
    );
  }, [reduced, wave, at, duration, times]);
  const style = useAnimatedStyle(() => ({
    // Invisible before it starts and after it ends; 0.6 → 0 while it swells 1 → 1.5.
    opacity: wave.value === 0 ? 0 : 0.6 * (1 - wave.value),
    transform: [{ scale: 1 + 0.5 * wave.value }],
  }));

  return (
    <View>
      <View className="absolute inset-0">
        <Animated.View style={style}>
          <Svg width={size} height={height}>
            <Polygon points={hexPolygon(size, height)} fill={c.honey} />
          </Svg>
        </Animated.View>
      </View>
      {children}
    </View>
  );
}
