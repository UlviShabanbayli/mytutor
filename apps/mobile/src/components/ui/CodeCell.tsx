import { useEffect } from 'react';
import { View } from 'react-native';
import {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { cn } from '@/lib/cn';
import { duration, easing, useReducedMotionPref } from '@/motion';
import { useThemeColors } from '@/theme';
import { AnimatedView } from './animated';
import { RiseIn } from './RiseIn';
import { Text } from './Text';

type CodeCellProps = {
  char: string;
  /** The next box to fill: honey border and a caret. */
  active: boolean;
  error: boolean;
  /** Box size classes from the caller, e.g. "h-[60px] flex-1". */
  className?: string;
  /** Text size class of the character. */
  textClassName?: string;
};

/**
 * One box of an SMS or link code (micro.otp A · Sakit): a typed character fades up 4pt in
 * 120ms, a filled box warms to honey-deep / raised, and a wrong code cross-fades every box to
 * err in 220ms. Nothing shakes.
 */
export function CodeCell({ char, active, error, className, textClassName }: CodeCellProps) {
  const colors = useThemeColors();
  const reduced = useReducedMotionPref();
  const filled = useSharedValue(char ? 1 : 0);
  const current = useSharedValue(active ? 1 : 0);
  const bad = useSharedValue(error ? 1 : 0);

  useEffect(() => {
    const quick = { duration: reduced ? 0 : duration.quick, easing: easing.enter };
    filled.value = withTiming(char ? 1 : 0, quick);
    current.value = withTiming(active ? 1 : 0, quick);
    bad.value = withTiming(error ? 1 : 0, {
      duration: reduced ? duration.reduced : duration.base,
    });
  }, [char, active, error, reduced, filled, current, bad]);

  const { border, surf, raised, honey, err } = colors;
  const deep = colors['honey-deep'];
  const errBg = colors['err-bg'];
  const box = useAnimatedStyle(() => {
    const warm = interpolateColor(filled.value, [0, 1], [border, deep]);
    const edge = interpolateColor(current.value, [0, 1], [warm, honey]);
    const ground = interpolateColor(filled.value * (1 - current.value), [0, 1], [surf, raised]);
    return {
      borderColor: interpolateColor(bad.value, [0, 1], [edge, err]),
      backgroundColor: interpolateColor(bad.value, [0, 1], [ground, errBg]),
    };
  });

  return (
    <AnimatedView
      style={box}
      className={cn('items-center justify-center rounded-md border-2', className)}
    >
      {char ? (
        <RiseIn key={char} from={4} duration={duration.quick}>
          <Text
            className={cn(
              'font-display-black text-2xl',
              error ? 'text-err' : 'text-ink',
              textClassName,
            )}
          >
            {char}
          </Text>
        </RiseIn>
      ) : active && !error ? (
        <View className="h-7 w-0.5 rounded-full bg-honey" />
      ) : null}
    </AnimatedView>
  );
}
