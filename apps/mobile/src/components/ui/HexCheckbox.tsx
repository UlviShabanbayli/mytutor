import { useEffect, useId, useRef } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { ClipPath, Defs, Path, Polygon, Rect } from 'react-native-svg';
import { playCue } from '@/lib/cues';
import { CHECK_LENGTH, CHECK_PATH, hexPoints } from '@/lib/strokes';
import { duration, easing, useReducedMotionPref } from '@/motion';
import { useThemeColors } from '@/theme';

const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);
const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedPath = Animated.createAnimatedComponent(Path);

/** micro.check C: the check starts drawing 160ms after the honey begins to fill. */
const CHECK_DELAY = 160;
/** The lab's 28 × 31 box with a 2.5pt edge. */
const RATIO = 31 / 28;
const EDGE = 2.5;

type HexCheckboxProps = {
  checked: boolean;
  /** Width in points; the hexagon is about 1.1× as tall. */
  size?: number;
};

/**
 * The box of a checkbox row as a honeycomb cell: honey fills it from the bottom, then the
 * check draws itself (micro.check C · Pətək). Only the picture; the row around it keeps the
 * `checkbox` role and label. A selection tick plays when it changes.
 */
export function HexCheckbox({ checked, size = 28 }: HexCheckboxProps) {
  const colors = useThemeColors();
  const reduced = useReducedMotionPref();
  const clipId = `hexbox${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const w = size;
  const h = Math.round(size * RATIO);
  const fill = useSharedValue(checked ? 1 : 0);
  const draw = useSharedValue(checked ? 0 : CHECK_LENGTH);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    playCue('select');
    const to = checked ? 1 : 0;
    if (reduced) {
      fill.value = withTiming(to, { duration: duration.reduced });
      draw.value = checked ? 0 : CHECK_LENGTH;
      return;
    }
    fill.value = withTiming(to, { duration: duration.base, easing: easing.enter });
    draw.value = checked
      ? withDelay(CHECK_DELAY, withTiming(0, { duration: duration.base, easing: easing.enter }))
      : withTiming(CHECK_LENGTH, { duration: duration.quick, easing: easing.away });
  }, [checked, reduced, fill, draw]);

  // The honey-deep edge fades in over the grey one (animated `fill` does not reach the web).
  const edgeProps = useAnimatedProps(() => ({ opacity: fill.value }));
  const honeyProps = useAnimatedProps(() => ({ y: h * (1 - fill.value), height: h * fill.value }));
  const checkProps = useAnimatedProps(() => ({ strokeDashoffset: draw.value }));
  const mark = (w - 8) / 24;

  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width={w} height={h}>
        <Defs>
          <ClipPath id={clipId}>
            <Polygon points={hexPoints(w, h, EDGE)} />
          </ClipPath>
        </Defs>
        <Polygon points={hexPoints(w, h)} fill={colors['slat-edge']} />
        <AnimatedPolygon
          points={hexPoints(w, h)}
          fill={colors['honey-deep']}
          animatedProps={edgeProps}
        />
        <Polygon points={hexPoints(w, h, EDGE)} fill={colors.surf} />
        <AnimatedRect
          x={0}
          width={w}
          fill={colors.honey}
          clipPath={`url(#${clipId})`}
          animatedProps={honeyProps}
        />
        <AnimatedPath
          d={CHECK_PATH}
          fill="none"
          stroke={colors['on-honey']}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={CHECK_LENGTH}
          animatedProps={checkProps}
          // The 24pt check sits in the middle of the cell.
          transform={`translate(${4} ${(h - 24 * mark) / 2}) scale(${mark})`}
        />
      </Svg>
    </View>
  );
}
