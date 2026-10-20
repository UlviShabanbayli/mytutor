import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { Text } from '@/components/ui/Text';
import { easing, useReducedMotionPref } from '@/motion';
import { streakC } from './timelines';

type NumberRollProps = {
  from: number;
  to: number;
  /** When the roll starts, in ms after mount. */
  delay: number;
  className?: string;
};

/**
 * An odometer step (feedback.streak): the old number leaves upwards (220ms) while the new one
 * rolls in from below (260ms, 80ms later). Less motion: the new number, still. Callers give
 * screen readers the new value. Every other number rolls with `RollingNumber` (micro.count);
 * this one keeps the streak moment's own whole-number step and timing.
 */
export function NumberRoll({ from, to, delay, className }: NumberRollProps) {
  const reduced = useReducedMotionPref();
  const [height, setHeight] = useState(0);
  const out = useSharedValue(reduced ? 1 : 0);
  const into = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced || !height) return;
    out.value = withDelay(delay, withTiming(1, { duration: streakC.rollOut, easing: easing.away }));
    into.value = withDelay(
      delay + streakC.rollGap,
      withTiming(1, { duration: streakC.rollIn, easing: easing.enter }),
    );
  }, [reduced, height, delay, out, into]);

  const oldStyle = useAnimatedStyle(() => ({
    opacity: 1 - out.value,
    transform: [{ translateY: -height * out.value }],
  }));
  const newStyle = useAnimatedStyle(() => ({
    opacity: into.value,
    transform: [{ translateY: height * (1 - into.value) }],
  }));

  return (
    <View className="overflow-hidden">
      {reduced ? null : (
        <>
          {/* A zero-height copy of the old number keeps the window as wide as the wider one. */}
          <View className="h-0 overflow-hidden" accessibilityElementsHidden>
            <Text className={className}>{from}</Text>
          </View>
          <View className="absolute left-0 top-0">
            <Animated.View style={oldStyle}>
              <Text className={className}>{from}</Text>
            </Animated.View>
          </View>
        </>
      )}
      <Animated.View style={newStyle} onLayout={(e) => setHeight(e.nativeEvent.layout.height)}>
        <Text className={className}>{to}</Text>
      </Animated.View>
    </View>
  );
}
