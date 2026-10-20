import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Polygon } from 'react-native-svg';
import { hexPerimeter, hexPoints } from '@/components/feedback/motionMath';
import { PopIn } from '@/components/feedback/PopIn';
import { RisingFill } from '@/components/feedback/RisingFill';
import { rankUpB } from '@/components/feedback/timelines';
import { Icon, Text } from '@/components/ui';
import { duration, easing, useReducedMotionPref } from '@/motion';
import { useThemeColors } from '@/theme';

const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);

const W = 96;
const H = 108;
const STROKE = 3;
/** The face sits 8pt inside the outline, as in the lab. */
const INSET = 8;

type RankSealProps = {
  /** The new rank's place on the ladder, 1-based. */
  step: number;
};

/**
 * feedback.rankup B, the new rank's seal on the honey screen: its hex outline draws (450ms), the
 * face fills from the bottom (400ms), the wing and number pop with a small overshoot and one soft
 * pulse goes out (700ms). Decorative: the title names the rank. Less motion: the finished seal.
 */
export function RankSeal({ step }: RankSealProps) {
  const c = useThemeColors();
  const reduced = useReducedMotionPref();
  const length = hexPerimeter(W - STROKE, H - STROKE);
  const drawn = useSharedValue(reduced ? 1 : 0);
  const level = useSharedValue(reduced ? 1 : 0);
  const pulse = useSharedValue(reduced ? 1 : 0);
  const face = { w: W - 2 * INSET, h: H - 2 * INSET };

  useEffect(() => {
    if (reduced) return;
    drawn.value = withDelay(
      rankUpB.outlineAt,
      withTiming(1, { duration: rankUpB.outline, easing: easing.breathe }),
    );
    level.value = withDelay(
      rankUpB.fillAt,
      withTiming(1, { duration: duration.fill, easing: easing.enter }),
    );
    pulse.value = withDelay(
      rankUpB.iconAt,
      withTiming(1, { duration: rankUpB.pulse, easing: easing.enter }),
    );
  }, [reduced, drawn, level, pulse]);

  const outline = useAnimatedProps(() => ({ strokeDashoffset: length * (1 - drawn.value) }));
  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulse.value > 0 && pulse.value < 1 ? 0.6 * (1 - pulse.value) : 0,
    transform: [{ scale: 1 + 0.35 * pulse.value }],
  }));

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className="h-[108px] w-[96px] items-center justify-center"
    >
      <View className="absolute inset-0">
        <Animated.View style={pulseStyle}>
          <Svg width={W} height={H}>
            <Polygon points={hexPoints(W, H)} fill={c.cap} />
          </Svg>
        </Animated.View>
      </View>
      <View className="absolute inset-0">
        <Svg width={W} height={H}>
          <AnimatedPolygon
            points={hexPoints(W, H, STROKE / 2)}
            fill="none"
            stroke={c['on-honey']}
            strokeWidth={STROKE}
            strokeLinejoin="round"
            strokeDasharray={`${length} ${length}`}
            animatedProps={outline}
          />
        </Svg>
      </View>
      <View className="absolute left-[8px] top-[8px]">
        <Svg width={face.w} height={face.h}>
          <Polygon points={hexPoints(face.w, face.h)} fill={c['honey-deep']} />
        </Svg>
        <RisingFill width={face.w} height={face.h} level={level}>
          <Svg width={face.w} height={face.h}>
            <Polygon points={hexPoints(face.w, face.h)} fill={c['on-honey']} />
          </Svg>
        </RisingFill>
      </View>
      <PopIn delay={rankUpB.iconAt} duration={rankUpB.icon}>
        <View className="items-center">
          <Icon name="wing" size={30} color="honey" />
          <Text className="font-display-black text-2xl leading-[26px] text-honey">{step}</Text>
        </View>
      </PopIn>
    </View>
  );
}
