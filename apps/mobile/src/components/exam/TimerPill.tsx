import { useEffect, useRef } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import {
  clockParts,
  crossedIntoLastMinutes,
  formatClock,
  isLastMinutes,
  timeShare,
} from '@/features/exam/mockTimer';
import { cn } from '@/lib/cn';
import { playCue } from '@/lib/cues';
import { duration, easing, useReducedMotionPref } from '@/motion';
import { radius, useThemeColors } from '@/theme';
import { TimerRing } from './TimerRing';

type TimerPillProps = {
  remainingMs: number;
  /** The mock's whole time, so the ring can show the share left (full ring without it). */
  totalMs?: number;
  size?: 'md' | 'sm';
  /** Say "Son 5 dəqiqə" once when 05:00 is crossed; only one pill on screen should. */
  announce?: boolean;
};

/**
 * Time left on the inverted pill, with a ring that empties (micro.timer B · Rəng keçidi). At
 * 05:00 the pill and ring turn from honey to red over 900ms, once, with no blinking and no
 * text under it: screen readers hear the warning instead. Read on focus only otherwise.
 */
export function TimerPill({ remainingMs, totalMs, size = 'md', announce = false }: TimerPillProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const reduced = useReducedMotionPref();
  const { minutes, seconds } = clockParts(remainingMs);
  const md = size === 'md';
  const late = isLastMinutes(remainingMs);
  const warn = useSharedValue(late ? 1 : 0);
  const previous = useRef<number | null>(null);

  useEffect(() => {
    warn.value = withTiming(late ? 1 : 0, {
      duration: reduced ? duration.reduced : duration.warn,
      easing: easing.inOut,
    });
  }, [late, reduced, warn]);

  useEffect(() => {
    if (announce && crossedIntoLastMinutes(previous.current, remainingMs)) {
      playCue('warning');
      AccessibilityInfo.announceForAccessibility(t('exam.run.lastMinutes'));
    }
    previous.current = remainingMs;
  }, [announce, remainingMs, t]);

  const { spot } = colors;
  const errBg = colors['err-bg'];
  const corner = radius.md;
  const chip = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(warn.value, [0, 1], [spot, errBg]),
    borderRadius: corner,
  }));
  // The red time fades in over the light one (Animated.Text takes no font classes here).
  const red = useAnimatedStyle(() => ({ opacity: warn.value }));
  const time = md ? 'font-display-black text-base' : 'font-sans-black text-sm';

  return (
    <View
      accessible
      accessibilityRole="timer"
      accessibilityLabel={t('exam.run.timerA11y', {
        minutes: t('exam.run.minutesLong', { count: minutes }),
        seconds: t('exam.run.secondsLong', { count: seconds }),
      })}
      className={cn(
        'flex-row items-center rounded-md',
        md ? 'h-10 gap-1.5 pl-1.5 pr-3' : 'h-8 gap-1 pl-1 pr-2.5',
      )}
    >
      {/* The chip's colour is an animated layer behind the content. */}
      <Animated.View style={[StyleSheet.absoluteFill, chip]} />
      {/* In a View, so the web paints it above the absolutely placed colour layer. */}
      <View>
        <TimerRing
          share={totalMs ? timeShare(remainingMs, totalMs) : 1}
          warn={warn}
          size={md ? 28 : 22}
          stroke={md ? 3.5 : 3}
        />
      </View>
      <View>
        <Text className={cn(time, 'text-on-spot')}>{formatClock(remainingMs)}</Text>
        <Animated.View style={[StyleSheet.absoluteFill, red]}>
          <Text className={cn(time, 'text-err')}>{formatClock(remainingMs)}</Text>
        </Animated.View>
      </View>
    </View>
  );
}
