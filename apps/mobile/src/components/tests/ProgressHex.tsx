import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Polygon } from 'react-native-svg';
import { hexPoints } from '@/components/feedback/motionMath';
import { RisingFill } from '@/components/feedback/RisingFill';
import { duration, easing, useReducedMotionPref } from '@/motion';
import { useThemeColors } from '@/theme';

export type ProgressCell = 'done' | 'current' | 'next';

type ProgressHexProps = {
  state: ProgressCell;
  width: number;
};

/** The honey rim is 2pt wide, as in the lab (the fill sits at left-[2px] top-[2px]). */
const RIM = 2;

/**
 * One question of the run in the test header (feedback.progress C): wax while ahead, a honey rim
 * (220ms) for the current question, filled with honey from the bottom (400ms) once answered.
 * Decorative: the header's progress bar role carries "Sual 4 / 10".
 */
export function ProgressHex({ state, width }: ProgressHexProps) {
  const c = useThemeColors();
  const reduced = useReducedMotionPref();
  const height = width * 1.125;
  const inner = { w: width - 2 * RIM, h: height - 2 * RIM };
  const rim = useSharedValue(state === 'next' ? 0 : 1);
  const level = useSharedValue(state === 'done' ? 1 : 0);

  useEffect(() => {
    const fade = { duration: reduced ? duration.reduced : duration.base };
    rim.value = withTiming(state === 'next' ? 0 : 1, fade);
    level.value = reduced
      ? state === 'done'
        ? 1
        : 0
      : withTiming(state === 'done' ? 1 : 0, { duration: duration.fill, easing: easing.enter });
  }, [state, reduced, rim, level]);

  const rimStyle = useAnimatedStyle(() => ({ opacity: rim.value }));

  return (
    // Sizes follow the header's width (10 cells of up to 20pt), so they cannot be classes.
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <Polygon points={hexPoints(width, height)} fill={c.wax} />
      </Svg>
      <View className="absolute inset-0">
        <Animated.View style={rimStyle}>
          <Svg width={width} height={height}>
            <Polygon points={hexPoints(width, height)} fill={c.honey} />
            <Polygon points={hexPoints(width, height, RIM)} fill={c.wax} />
          </Svg>
        </Animated.View>
      </View>
      <View className="absolute left-[2px] top-[2px]">
        <RisingFill width={inner.w} height={inner.h} level={level}>
          <Svg width={inner.w} height={inner.h}>
            <Polygon points={hexPoints(inner.w, inner.h)} fill={c.honey} />
          </Svg>
        </RisingFill>
      </View>
    </View>
  );
}
