import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Polygon } from 'react-native-svg';
import { hexPoints } from '@/lib/strokes';
import { duration, easing, useReducedMotionPref } from '@/motion';
import { useThemeColors } from '@/theme';

const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);

/** micro.typing B: three 11 × 12 hexagons, 200ms apart. */
const W = 11;
const H = 12;
const STAGGER = 200;
const POINTS = hexPoints(W, H);

function PulseHex({ index, reduced }: { index: number; reduced: boolean }) {
  const colors = useThemeColors();
  const p = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) {
      p.value = 1;
      return;
    }
    p.value = withDelay(
      index * STAGGER,
      withRepeat(withTiming(1, { duration: duration.pulse, easing: easing.inOut }), -1, true),
    );
    return () => cancelAnimation(p);
  }, [index, reduced, p]);

  const scale = useAnimatedStyle(() => ({ transform: [{ scale: 0.72 + 0.28 * p.value }] }));
  // Honey fades in over wax: animating `fill` itself does not reach the DOM on the web.
  const honey = useAnimatedProps(() => ({ opacity: p.value }));

  return (
    <Animated.View style={scale}>
      <Svg width={W} height={H}>
        <Polygon points={POINTS} fill={colors.wax} />
        <AnimatedPolygon points={POINTS} fill={colors.honey} animatedProps={honey} />
      </Svg>
    </Animated.View>
  );
}

/**
 * Vızı is thinking: three honeycomb cells pulse in turn, wax to honey (micro.typing B ·
 * Pətək nəbzi). Decorative; the text next to it says it. With less motion they rest in honey.
 */
export function TypingHexes() {
  const reduced = useReducedMotionPref();

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className="flex-row items-center gap-1"
    >
      {[0, 1, 2].map((i) => (
        <PulseHex key={i} index={i} reduced={reduced} />
      ))}
    </View>
  );
}
