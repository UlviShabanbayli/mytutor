import { useEffect, useId } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { ClipPath, Defs, G, Path, Polygon } from 'react-native-svg';
import { hexPoints, wavePath } from '@/components/feedback/motionMath';
import { lessonDoneB } from '@/components/feedback/timelines';
import { Text } from '@/components/ui';
import { easing, useReducedMotionPref } from '@/motion';
import { useThemeColors } from '@/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);

/** Nectar fills a learning cell half-way, as HexCell draws `lesson_completed`. */
const LEVEL = 0.5;

type NectarRiseProps = {
  /** Width in points; the pointy-top hexagon is ×1.125 as tall (as HexCell). */
  size: number;
  /** The topic number inside, e.g. "4.3". */
  label: string;
};

/**
 * feedback.lessondone B: the topic's cell fills with nectar under a moving wave (two 1.2s runs,
 * calming at the end to HexCell's flat `lesson_completed` look). Decorative: the row around it
 * names the change. Less motion: the filled cell, still.
 */
export function NectarRise({ size, label }: NectarRiseProps) {
  const c = useThemeColors();
  const reduced = useReducedMotionPref();
  const w = size;
  const h = Math.round(size * 1.125);
  const amplitude = h * 0.03;
  const level = useSharedValue(reduced ? LEVEL : 0);
  const phase = useSharedValue(0);
  const calm = useSharedValue(reduced ? 0 : 1);
  // Clip ids must be unique per instance: on the web all SVGs share one document.
  const clipId = `nectar${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  useEffect(() => {
    if (reduced) return;
    const { waveAt, wave, fillAt, fill } = lessonDoneB;
    level.value = withDelay(fillAt, withTiming(LEVEL, { duration: fill, easing: easing.fill }));
    // Two wavelengths per run, so each run ends where the next begins.
    phase.value = withDelay(
      waveAt,
      withRepeat(withTiming(2, { duration: wave, easing: Easing.linear }), 2, false),
    );
    calm.value = withDelay(waveAt + wave, withTiming(0, { duration: wave }));
  }, [reduced, level, phase, calm]);

  const nectar = useAnimatedProps(() => ({
    d: wavePath(w, h, level.value, phase.value, amplitude * calm.value),
  }));

  return (
    // The cell's size is a prop, as HexCell's.
    <View className="items-center justify-center" style={{ width: w, height: h }}>
      <View className="absolute inset-0">
        <Svg width={w} height={h}>
          <Defs>
            <ClipPath id={clipId}>
              <Polygon points={hexPoints(w, h)} />
            </ClipPath>
          </Defs>
          <Polygon points={hexPoints(w, h)} fill={c.wax} />
          <G clipPath={`url(#${clipId})`}>
            <AnimatedPath animatedProps={nectar} fill={c.nectar} />
          </G>
        </Svg>
      </View>
      <Text className="font-sans-black text-sm text-on-nectar">{label}</Text>
    </View>
  );
}
