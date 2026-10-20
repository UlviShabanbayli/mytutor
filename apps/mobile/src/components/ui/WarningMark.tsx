import { useEffect } from 'react';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { View } from 'react-native';
import { WARNING_LENGTH, WARNING_TRIANGLE } from '@/lib/strokes';
import { duration, easing, useReducedMotionPref } from '@/motion';
import { useThemeColors } from '@/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);

/** micro.field B: the stroke starts 80ms after the message begins to slide in. */
const DRAW_DELAY = 80;

/** The warning icon of a field error, whose triangle draws itself once (micro.field B). */
export function WarningMark({ size = 16 }: { size?: number }) {
  const colors = useThemeColors();
  const reduced = useReducedMotionPref();
  const draw = useSharedValue(reduced ? 0 : 1);

  useEffect(() => {
    if (reduced) return;
    draw.value = withDelay(
      DRAW_DELAY,
      withTiming(0, { duration: duration.base, easing: easing.enter }),
    );
  }, [reduced, draw]);

  const triangle = useAnimatedProps(() => ({ strokeDashoffset: draw.value * WARNING_LENGTH }));
  const bang = useAnimatedProps(() => ({ strokeOpacity: 1 - draw.value }));

  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={colors.err}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <AnimatedPath
          d={WARNING_TRIANGLE}
          strokeDasharray={WARNING_LENGTH}
          animatedProps={triangle}
        />
        <AnimatedPath d="M12 10v4.5M12 17.4v.1" animatedProps={bang} />
      </Svg>
    </View>
  );
}
