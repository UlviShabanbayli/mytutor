import { useEffect, type ReactNode } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { duration, easing, useReducedMotionPref } from '@/motion';
import { fadeUpBy } from './timelines';

type FadeUpProps = {
  /** Start, in ms after mount. */
  delay?: number;
  /** Layout of the block among its siblings (`self-stretch`, `flex-1`). */
  className?: string;
  /** Layout of the children inside the block (`items-center gap-3`). */
  contentClassName?: string;
  /** The block grows to fill its parent (with `flex-1` in className). */
  fill?: boolean;
  children: ReactNode;
};

/**
 * The lab's text entrance: rises 8pt while fading in over 220ms. Less motion: a 150ms fade in
 * place.
 */
export function FadeUp({
  delay = 0,
  className,
  contentClassName,
  fill = false,
  children,
}: FadeUpProps) {
  const reduced = useReducedMotionPref();
  const shown = useSharedValue(0);

  useEffect(() => {
    shown.value = reduced
      ? withTiming(1, { duration: duration.reduced })
      : withDelay(delay, withTiming(1, { duration: duration.base, easing: easing.enter }));
  }, [shown, delay, reduced]);

  const style = useAnimatedStyle(() => ({
    flex: fill ? 1 : undefined,
    opacity: shown.value,
    transform: [{ translateY: reduced ? 0 : fadeUpBy * (1 - shown.value) }],
  }));

  return (
    // Animated views take no className (NativeWind styles plain views), so layout sits outside.
    <View className={className}>
      <Animated.View style={style}>
        {contentClassName ? <View className={contentClassName}>{children}</View> : children}
      </Animated.View>
    </View>
  );
}
