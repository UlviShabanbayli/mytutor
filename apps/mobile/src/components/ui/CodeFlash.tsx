import { type ReactNode, useEffect } from 'react';
import {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { cn } from '@/lib/cn';
import { withAlpha } from '@/lib/color';
import { duration, useReducedMotionPref } from '@/motion';
import { useThemeColors } from '@/theme';
import { AnimatedView } from './animated';

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
    <AnimatedView className={cn('self-start rounded-[8px]', className)}>
      <AnimatedView
        pointerEvents="none"
        style={style}
        className="absolute -inset-x-1 inset-y-0 rounded-[8px]"
      />
      {children}
    </AnimatedView>
  );
}
