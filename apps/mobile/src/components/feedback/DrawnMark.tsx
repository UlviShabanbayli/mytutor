import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { duration, easing } from '@/motion';
import { useThemeColors, type ColorName } from '@/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);

// The icon set's check and cross (24pt grid) with the length of each stroke.
const strokes = {
  check: [{ d: 'M5 12.5l4.5 4.5L19 7.5', length: Math.hypot(4.5, 4.5) + Math.hypot(9.5, 9.5) }],
  x: [
    { d: 'M7 7l10 10', length: Math.hypot(10, 10) },
    { d: 'M17 7 7 17', length: Math.hypot(10, 10) },
  ],
} as const;

type DrawnMarkProps = {
  kind: 'check' | 'x';
  size?: number;
  color: ColorName;
  /** When the stroke starts drawing, in ms after mount. */
  delay?: number;
  strokeWidth?: number;
  /** Less motion: the mark is simply there. */
  reduced: boolean;
};

function Stroke({ d, length, drawn }: { d: string; length: number; drawn: SharedValue<number> }) {
  const props = useAnimatedProps(() => ({ strokeDashoffset: length * (1 - drawn.value) }));
  return <AnimatedPath d={d} strokeDasharray={`${length} ${length}`} animatedProps={props} />;
}

/**
 * A check or a cross that draws itself in 300ms (feedback.correct / wrong / goal). Decorative:
 * the words next to it ("Düz", "Səhv") carry the meaning.
 */
export function DrawnMark({
  kind,
  size = 16,
  color,
  delay = 0,
  strokeWidth = 2.2,
  reduced,
}: DrawnMarkProps) {
  const colors = useThemeColors();
  const drawn = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    drawn.value = reduced
      ? 1
      : withDelay(delay, withTiming(1, { duration: duration.draw, easing: easing.enter }));
  }, [drawn, delay, reduced]);

  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={colors[color]}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {strokes[kind].map((s) => (
          <Stroke key={s.d} d={s.d} length={s.length} drawn={drawn} />
        ))}
      </Svg>
    </View>
  );
}
