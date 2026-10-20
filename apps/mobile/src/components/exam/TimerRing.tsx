import Animated, { type SharedValue, useAnimatedProps } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { withAlpha } from '@/lib/color';
import { circleLength } from '@/lib/strokes';
import { useThemeColors } from '@/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type TimerRingProps = {
  /** Share of the time left, 0–1. */
  share: number;
  /** 0 → honey, 1 → err: the last five minutes (micro.timer B). */
  warn: SharedValue<number>;
  size: number;
  stroke: number;
};

/**
 * The ring around the mock clock: it empties as time runs out and turns red at 05:00. The red
 * ring fades in over the honey one (animated stroke colours do not reach the web).
 */
export function TimerRing({ share, warn, size, stroke }: TimerRingProps) {
  const colors = useThemeColors();
  const r = (size - stroke) / 2;
  const c = size / 2;
  const length = circleLength(r);
  const red = useAnimatedProps(() => ({ opacity: warn.value }));
  const calm = useAnimatedProps(() => ({ opacity: 1 - warn.value }));
  const bar = {
    cx: c,
    cy: c,
    r,
    fill: 'none',
    strokeWidth: stroke,
    strokeLinecap: 'round' as const,
    strokeDasharray: length,
    strokeDashoffset: length * (1 - share),
    // The ring starts at 12 o'clock, like a clock hand.
    transform: `rotate(-90 ${c} ${c})`,
  };

  return (
    <Svg width={size} height={size}>
      <AnimatedCircle
        cx={c}
        cy={c}
        r={r}
        fill="none"
        strokeWidth={stroke}
        stroke={withAlpha(colors['on-spot'], 0.22)}
        animatedProps={calm}
      />
      <AnimatedCircle
        cx={c}
        cy={c}
        r={r}
        fill="none"
        strokeWidth={stroke}
        stroke={withAlpha(colors.err, 0.22)}
        animatedProps={red}
      />
      <AnimatedCircle {...bar} stroke={colors.honey} animatedProps={calm} />
      <AnimatedCircle {...bar} stroke={colors.err} animatedProps={red} />
    </Svg>
  );
}
