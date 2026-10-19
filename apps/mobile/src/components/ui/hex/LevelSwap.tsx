import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { cn } from '@/lib/cn';
import { SWAP_MS } from './levelChange';

type LevelSwapProps = {
  /** When the new level's ink and word take over, in ms after mount. */
  at: number;
  before: ReactNode;
  after: ReactNode;
  /** `start` keeps both left-aligned (a level pill next to a title). */
  align?: 'center' | 'start';
};

/** Cross-fades a cell's label or a level pill from the old level to the new one. */
export function LevelSwap({ at, before, after, align = 'center' }: LevelSwapProps) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withDelay(at, withTiming(1, { duration: SWAP_MS }));
  }, [progress, at]);
  const afterStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const beforeStyle = useAnimatedStyle(() => ({ opacity: 1 - progress.value }));
  const place = align === 'center' ? 'items-center' : 'items-start';

  return (
    // Full width, so the outgoing label or pill is never squeezed to the new one's width.
    <View className={cn('self-stretch', place)}>
      <Animated.View style={afterStyle}>
        <View className={cn('gap-px', place)}>{after}</View>
      </Animated.View>
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        className={cn('absolute inset-0 justify-center', place)}
      >
        <Animated.View style={beforeStyle}>
          <View className={cn('gap-px', place)}>{before}</View>
        </Animated.View>
      </View>
    </View>
  );
}
