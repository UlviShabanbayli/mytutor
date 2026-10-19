import { useEffect } from 'react';
import {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { View } from 'react-native';
import { AnimatedView } from '@/components/ui/animated';
import { withAlpha } from '@/lib/color';
import { cn } from '@/lib/cn';
import { duration, spring, useReducedMotionPref } from '@/motion';
import { useThemeColors } from '@/theme';

const corner = 'absolute h-[30px] w-[30px] border-honey';
/** micro.camera C: the frame dips to 0.96 for 90ms and springs back. */
const SNAP_SCALE = 0.96;
const SNAP_IN = 90;

type ViewfinderGuideProps = {
  /** After the shot the outside darkens, so the framed question stands out (no flash). */
  dim?: boolean;
  /** Raise it to snap the frame once, at the moment of the shot. */
  snap?: number;
};

/**
 * Over the camera picture: a dimmed scrim with a clear honey-cornered frame in the upper
 * middle, where one question should fit. Purely visual; the hint below says it in words.
 */
export function ViewfinderGuide({ dim = false, snap = 0 }: ViewfinderGuideProps) {
  const colors = useThemeColors();
  const reduced = useReducedMotionPref();
  const dark = useSharedValue(dim ? 1 : 0);
  const scale = useSharedValue(1);

  useEffect(() => {
    dark.value = withTiming(dim ? 1 : 0, { duration: reduced ? duration.reduced : duration.dim });
  }, [dim, reduced, dark]);

  useEffect(() => {
    if (snap === 0 || reduced) return;
    scale.value = withSequence(
      withTiming(SNAP_SCALE, { duration: SNAP_IN }),
      withSpring(1, spring.calm),
    );
  }, [snap, reduced, scale]);

  const { scrim } = colors;
  const darker = withAlpha(colors.spot, 0.88);
  const shade = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(dark.value, [0, 1], [scrim, darker]),
  }));
  const frame = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className="absolute inset-0"
    >
      <AnimatedView style={shade} className="flex-1" />
      <View className="flex-row">
        <AnimatedView style={shade} className="w-5" />
        <AnimatedView style={frame} className="aspect-[9/4] flex-1 rounded-[18px]">
          <View className={cn(corner, 'left-0 top-0 rounded-tl-[18px] border-l-4 border-t-4')} />
          <View className={cn(corner, 'right-0 top-0 rounded-tr-[18px] border-r-4 border-t-4')} />
          <View className={cn(corner, 'bottom-0 left-0 rounded-bl-[18px] border-b-4 border-l-4')} />
          <View
            className={cn(corner, 'bottom-0 right-0 rounded-br-[18px] border-b-4 border-r-4')}
          />
        </AnimatedView>
        <AnimatedView style={shade} className="w-5" />
      </View>
      <AnimatedView style={shade} className="flex-[1.6]" />
    </View>
  );
}
