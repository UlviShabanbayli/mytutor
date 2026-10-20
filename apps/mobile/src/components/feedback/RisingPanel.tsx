import { useEffect, useState, type ReactNode } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { cn } from '@/lib/cn';
import { duration, easing, spring, useReducedMotionPref } from '@/motion';

/** The panel's colour reaches this far below the screen, so a spring's overshoot shows no gap. */
const OVERSCAN = 40;

type RisingPanelProps = {
  /** When the panel starts rising, in ms after mount. */
  at: number;
  /** feedback.correct B springs up; the calm panels (wrong, sent) rise in 400ms. */
  springy: boolean;
  /** Background class of the panel, e.g. `bg-ok-bg`. */
  tone: string;
  /** The tallest the panel may be (a long explanation scrolls inside). */
  maxHeight?: number;
  /** Drawn over the panel's top edge, outside its scroll view (Vızı peeking). */
  overlay?: ReactNode;
  children: ReactNode;
};

/**
 * The bottom panel after "Yoxla": springs up (damping 16, stiffness 190) for a right answer,
 * rises calmly (400ms, ease-out) otherwise. Less motion: a 150ms fade in place.
 */
export function RisingPanel({ at, springy, tone, maxHeight, overlay, children }: RisingPanelProps) {
  const reduced = useReducedMotionPref();
  const [height, setHeight] = useState(0);
  const rise = useSharedValue(0);

  useEffect(() => {
    if (!height) return;
    if (reduced) {
      rise.value = withTiming(1, { duration: duration.reduced });
      return;
    }
    rise.value = withDelay(
      at,
      springy
        ? withSpring(1, spring.panel)
        : withTiming(1, { duration: duration.fill, easing: easing.enter }),
    );
  }, [height, at, springy, reduced, rise]);

  const style = useAnimatedStyle(() => {
    if (reduced) return { opacity: rise.value };
    // Hidden until measured, then it starts fully below its place.
    return {
      opacity: height ? 1 : 0,
      transform: [{ translateY: (1 - rise.value) * (height + OVERSCAN) }],
    };
  });

  return (
    <Animated.View
      style={style}
      onLayout={(e) => {
        if (!height) setHeight(e.nativeEvent.layout.height);
      }}
    >
      {/* The sheet never covers the whole screen; its height comes from the window. */}
      <View className={cn('rounded-t-3xl', tone)} style={maxHeight ? { maxHeight } : undefined}>
        {children}
        <View
          pointerEvents="none"
          className={cn('absolute inset-x-0 top-full', tone)}
          // Overscan below the screen edge, as the transitions.sheet spring does.
          style={{ height: OVERSCAN }}
        />
      </View>
      {overlay}
    </Animated.View>
  );
}
