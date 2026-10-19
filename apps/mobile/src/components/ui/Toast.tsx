import { useEffect } from 'react';
import { AccessibilityInfo, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { playCue } from '@/lib/cues';
import { duration, easing, spring, useReducedMotionPref } from '@/motion';
import { Icon } from './Icon';
import { Text } from './Text';

type ToastProps = {
  message: string;
  /** Called once the toast has left. */
  onDone: () => void;
};

/** transitions.toast B: the toast springs up from 64pt below and leaves 24pt down. */
const FROM = 64;
const AWAY = 24;

/**
 * "Yadda saxlandı": a dark capsule that springs up (damping 16, stiffness 220), stays 1.8s and
 * drops away in 180ms. With less motion it fades. Screen readers hear it once.
 */
export function Toast({ message, onDone }: ToastProps) {
  const reduced = useReducedMotionPref();
  const y = useSharedValue(reduced ? 0 : FROM);
  const opacity = useSharedValue(0);

  useEffect(() => {
    playCue('complete');
    AccessibilityInfo.announceForAccessibility(message);
    opacity.set(withTiming(1, { duration: reduced ? duration.reduced : duration.quick }));
    if (!reduced) y.set(withSpring(0, spring.toast));
    const timer = setTimeout(() => {
      const away = { duration: reduced ? duration.reduced : duration.leave, easing: easing.away };
      if (!reduced) y.set(withTiming(AWAY, away));
      opacity.set(
        withTiming(0, away, (finished) => {
          if (finished) scheduleOnRN(onDone);
        }),
      );
    }, duration.toastHold);
    return () => clearTimeout(timer);
  }, [message, onDone, opacity, reduced, y]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.get(),
    transform: [{ translateY: y.get() }],
  }));

  return (
    <Animated.View style={style}>
      <View
        accessibilityRole="text"
        accessibilityLiveRegion="polite"
        className="min-h-[40px] flex-row items-center gap-2 rounded-full bg-spot px-4 py-2"
      >
        <Icon name="check" size={18} color="honey" />
        <Text className="font-sans-black text-sm text-on-spot">{message}</Text>
      </View>
    </Animated.View>
  );
}
