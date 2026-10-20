import { useEffect } from 'react';
import { View } from 'react-native';
import { useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import Svg, { Polygon } from 'react-native-svg';
import { hexPoints } from '@/components/feedback/motionMath';
import { RisingFill } from '@/components/feedback/RisingFill';
import { duration, easing, useReducedMotionPref } from '@/motion';
import { useThemeColors, type ColorName } from '@/theme';

type FillingHexProps = {
  width: number;
  height: number;
  /** The hexagon before it fills. */
  base: ColorName;
  /** What rises in it from the bottom (400ms). */
  fill: ColorName;
  /** When the fill starts, in ms after mount. */
  at: number;
};

/**
 * Today's hexagon filling up as Vızı flies over it (feedback.streak C). Decorative: the week
 * row names the day. Less motion: already full.
 */
export function FillingHex({ width, height, base, fill, at }: FillingHexProps) {
  const c = useThemeColors();
  const reduced = useReducedMotionPref();
  const level = useSharedValue(reduced ? 1 : 0);
  const points = hexPoints(width, height);

  useEffect(() => {
    level.value = reduced
      ? 1
      : withDelay(at, withTiming(1, { duration: duration.fill, easing: easing.enter }));
  }, [level, at, reduced]);

  return (
    // Sizes come from the week row's cells.
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <Polygon points={points} fill={c[base]} />
      </Svg>
      <RisingFill width={width} height={height} level={level}>
        <Svg width={width} height={height}>
          <Polygon points={points} fill={c[fill]} />
        </Svg>
      </RisingFill>
    </View>
  );
}
