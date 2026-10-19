import { type ReactNode, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { cn } from '@/lib/cn';
import { withAlpha } from '@/lib/color';
import { duration, useReducedMotionPref } from '@/motion';
import { useThemeColors } from '@/theme';

type CodeFlashProps = {
  /** Raise it (e.g. a copy counter) to flash once; 0 never flashes. */
  flash: number;
  children: ReactNode;
  className?: string;
};

/** The copied code lights up in honey for a moment and fades (micro.copy A). */
export function CodeFlash({ flash, children, className }: CodeFlashProps) {
  const colors = useThemeColors();
  const reduced = useReducedMotionPref();
  const glow = useSharedValue(0);

  useEffect(() => {
    if (flash === 0) return;
    glow.value = withSequence(
      withTiming(1, { duration: 0 }),
      withTiming(0, { duration: reduced ? duration.reduced : duration.flash }),
    );
  }, [flash, reduced, glow]);

  const honey = withAlpha(colors.honey, 0.45);
  const style = useAnimatedStyle(() => ({ backgroundColor: honey, opacity: glow.value }));

  return (
    <View className={cn('self-start', className)}>
      {/* The plain View sizes and rounds the glow; the animated layer only fills it. */}
      <View
        pointerEvents="none"
        className="absolute -inset-x-1 inset-y-0 overflow-hidden rounded-[8px]"
      >
        <Animated.View style={[StyleSheet.absoluteFill, style]} />
      </View>
      {children}
    </View>
  );
}
