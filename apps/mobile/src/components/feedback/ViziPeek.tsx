import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Mascot } from '@/components/mascot/Mascot';
import { duration, easing, useReducedMotionPref } from '@/motion';
import { wrongC } from './timelines';

const SIZE = 64;

type ViziPeekProps = {
  /** When the panel under her starts rising, in ms after mount. */
  panelAt: number;
};

/**
 * feedback.wrong C: Vızı (təsəlli) peeks over the top edge of the calm panel and nods once. The
 * panel's text says the same, so she is decorative. Place inside the panel, outside any scroll
 * view; the panel's title row leaves her 60pt on the right. Less motion: a 150ms fade, no nod.
 */
export function ViziPeek({ panelAt }: ViziPeekProps) {
  const reduced = useReducedMotionPref();
  const shown = useSharedValue(0);
  const nod = useSharedValue(0);

  useEffect(() => {
    if (reduced) {
      shown.value = withTiming(1, { duration: duration.reduced });
      return;
    }
    const nodTiming = { duration: wrongC.nodHalf, easing: easing.breathe };
    shown.value = withDelay(
      panelAt + wrongC.peekAt,
      withTiming(1, { duration: wrongC.peekRise, easing: easing.pop }),
    );
    nod.value = withDelay(
      panelAt + wrongC.nodAt,
      withSequence(withTiming(wrongC.nodDeg, nodTiming), withTiming(0, nodTiming)),
    );
  }, [shown, nod, panelAt, reduced]);

  const style = useAnimatedStyle(() => ({
    opacity: Math.min(1, shown.value * 2),
    transform: [
      { translateY: reduced ? 0 : wrongC.peekFrom * (1 - shown.value) },
      { rotate: `${nod.value}deg` },
    ],
  }));

  return (
    <View pointerEvents="none" className="absolute -top-[48px] right-[12px]">
      <Animated.View style={style}>
        <Mascot moment="wrong" size={SIZE} decorative />
      </Animated.View>
    </View>
  );
}
