import { useEffect, useId, useRef } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { glintClock, startGlint } from '@/features/transitions/glintClock';
import { cn } from '@/lib/cn';
import { useReducedMotionPref } from '@/motion';
import { useThemeColors } from '@/theme';

type SkeletonBlockProps = {
  /** Size and corners of the content it stands for, e.g. "h-[68px] rounded-lg". */
  className?: string;
};

/** Width of the honey glint (transitions.skeleton: nectar at 55% in the middle). */
const GLINT = 240;

/**
 * A wax block where content will be, with a honey glint sweeping left to right. All blocks
 * share one clock and place the glint by their position on screen, so it reads as one sweep.
 * With less motion the blocks stay still. Decorative: the skeleton names itself.
 */
export function SkeletonBlock({ className }: SkeletonBlockProps) {
  const c = useThemeColors();
  const reduced = useReducedMotionPref();
  const { width } = useWindowDimensions();
  const id = `glint${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const ref = useRef<View>(null);
  const left = useSharedValue(0);

  useEffect(() => (reduced ? undefined : startGlint()), [reduced]);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: glintClock.get() * (width + GLINT) - GLINT - left.get() }],
  }));

  return (
    <View
      ref={ref}
      onLayout={() => ref.current?.measureInWindow((x) => left.set(x))}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className={cn('overflow-hidden bg-wax', className)}
    >
      {reduced ? null : (
        <Animated.View pointerEvents="none" style={[styles.glint, style]}>
          <Svg width={GLINT} height="100%">
            <Defs>
              <LinearGradient id={id} x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0.3" stopColor={c.nectar} stopOpacity={0} />
                <Stop offset="0.5" stopColor={c.nectar} stopOpacity={0.55} />
                <Stop offset="0.7" stopColor={c.nectar} stopOpacity={0} />
              </LinearGradient>
            </Defs>
            <Rect width={GLINT} height="100%" fill={`url(#${id})`} />
          </Svg>
        </Animated.View>
      )}
    </View>
  );
}

// The glint spans the block's height and starts at its left edge; the clock moves it.
const styles = StyleSheet.create({
  glint: { position: 'absolute', top: 0, bottom: 0, left: 0, width: GLINT },
});
