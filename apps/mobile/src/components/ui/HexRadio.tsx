import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Polygon } from 'react-native-svg';
import { playCue } from '@/lib/cues';
import { hexPoints } from '@/lib/strokes';
import { duration, easing, useReducedMotionPref } from '@/motion';
import { useThemeColors } from '@/theme';
import { AnimatedView } from './animated';

const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);

/** The lab's 22 × 24 ring with a 2.5pt edge and a 10 × 11 inner cell (micro.check C). */
const RATIO = 24 / 22;
const EDGE = 2.5;
const DOT = 10 / 22;

type HexRadioProps = {
  selected: boolean;
  size?: number;
};

/**
 * The mark of a one-of-many option as a honeycomb ring; the chosen one grows a small honey
 * cell inside (micro.check C · Pətək). Only the picture: the option keeps its `radio` role.
 * A selection tick plays when it becomes the chosen one.
 */
export function HexRadio({ selected, size = 22 }: HexRadioProps) {
  const colors = useThemeColors();
  const reduced = useReducedMotionPref();
  const w = size;
  const h = Math.round(size * RATIO);
  const dw = Math.round(size * DOT);
  const dh = Math.round(dw * 1.1);
  const on = useSharedValue(selected ? 1 : 0);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (selected) playCue('select');
    on.value = withTiming(selected ? 1 : 0, {
      duration: reduced ? duration.reduced : duration.base,
      easing: easing.enter,
    });
  }, [selected, reduced, on]);

  const deep = colors['honey-deep'];
  // The honey-deep ring fades in over the grey one (animated `fill` does not reach the web).
  const ringProps = useAnimatedProps(() => ({ opacity: on.value }));
  const dot = useAnimatedStyle(() =>
    reduced ? { opacity: on.value } : { transform: [{ scale: on.value }] },
  );

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className="items-center justify-center"
    >
      <Svg width={w} height={h}>
        <Polygon points={hexPoints(w, h)} fill={colors['slat-edge']} />
        <AnimatedPolygon points={hexPoints(w, h)} fill={deep} animatedProps={ringProps} />
        <Polygon points={hexPoints(w, h, EDGE)} fill={colors.surf} />
      </Svg>
      <AnimatedView style={dot} className="absolute">
        <Svg width={dw} height={dh}>
          <Polygon points={hexPoints(dw, dh)} fill={deep} />
        </Svg>
      </AnimatedView>
    </View>
  );
}
