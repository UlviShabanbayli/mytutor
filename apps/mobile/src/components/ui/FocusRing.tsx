import { useEffect } from 'react';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { duration, easing, spring, useReducedMotionPref } from '@/motion';
import { useThemeColors } from '@/theme';

/** micro.field B: the ring swells to 7pt in nectar, then settles at 4pt. */
const PEAK = 7;
const REST = 4;
/** The swell takes the first 160ms of the 400ms pulse. */
const SWELL = 160;

type FocusRingProps = {
  focused: boolean;
  error: boolean;
};

/**
 * The soft ring around a focused field (micro.field B · Halqa): it pulses out in nectar and
 * settles as a 4pt raised halo; on an error it is a calm 4pt err-bg halo. Sits behind the
 * field's box, which keeps its own border.
 */
export function FocusRing({ focused, error }: FocusRingProps) {
  const colors = useThemeColors();
  const reduced = useReducedMotionPref();
  const spread = useSharedValue(0);
  const glow = useSharedValue(0);
  const shown = useSharedValue(0);
  const bad = useSharedValue(error ? 1 : 0);

  useEffect(() => {
    bad.value = withTiming(error ? 1 : 0, { duration: duration.quick });
    const on = focused || error;
    shown.value = withTiming(on ? 1 : 0, { duration: reduced ? duration.reduced : duration.quick });
    if (!on) return;
    if (reduced || error) {
      spread.value = REST;
      glow.value = 0;
      return;
    }
    spread.value = withSequence(
      withTiming(PEAK, { duration: SWELL, easing: easing.enter }),
      withSpring(REST, spring.ring),
    );
    glow.value = withSequence(
      withTiming(1, { duration: SWELL, easing: easing.enter }),
      withTiming(0, { duration: duration.fill - SWELL, easing: easing.enter }),
    );
  }, [focused, error, reduced, spread, glow, shown, bad]);

  const raised = colors.raised;
  const nectar = colors.nectar;
  const errBg = colors['err-bg'];
  const ring = useAnimatedStyle(() => {
    const calm = interpolateColor(glow.value, [0, 1], [raised, nectar]);
    return {
      position: 'absolute',
      opacity: shown.value,
      top: -spread.value,
      bottom: -spread.value,
      left: -spread.value,
      right: -spread.value,
      // The field is rounded-lg (16pt); the halo keeps the same curve outside it.
      borderRadius: 16 + spread.value,
      backgroundColor: interpolateColor(bad.value, [0, 1], [calm, errBg]),
    };
  });

  return <Animated.View pointerEvents="none" style={ring} />;
}
