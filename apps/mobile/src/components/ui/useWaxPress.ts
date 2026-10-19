import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { duration, easing } from '@/motion';

/**
 * buttons.flat B for controls without an edge (icon, secondary and text buttons): a wax
 * background fades in (120 ms) and grows from 92% to 100% behind the content while pressed,
 * and fades out in 220 ms. No haptic. Render `waxStyle` on an absolute layer under the content.
 */
export function useWaxPress() {
  const wax = useSharedValue(0);

  const waxStyle = useAnimatedStyle(() => ({
    opacity: wax.get(),
    transform: [{ scale: 0.92 + 0.08 * wax.get() }],
  }));
  // The same press as a dim, for the danger button whose face is already coloured.
  const dimStyle = useAnimatedStyle(() => ({ opacity: 1 - 0.2 * wax.get() }));

  return {
    waxStyle,
    dimStyle,
    pressIn: () => {
      wax.set(withTiming(1, { duration: duration.quick, easing: easing.press }));
    },
    pressOut: () => {
      wax.set(withTiming(0, { duration: duration.base, easing: easing.press }));
    },
  };
}
