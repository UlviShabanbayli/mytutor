import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
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
 * feedback.wrong C: Vızı (təsəlli) peeks over the top edge of the calm panel; as she rises, the
 * rig plays vizi.wrong A (kind face, head tilt, two slow nods, a warm smile). The panel's text
 * says the same, so she is decorative. Place inside the panel, outside any scroll view; the
 * panel's title row leaves her 60pt on the right. Less motion: a 150ms fade and her kind face.
 */
export function ViziPeek({ panelAt }: ViziPeekProps) {
  const reduced = useReducedMotionPref();
  const shown = useSharedValue(0);
  const peekAt = panelAt + wrongC.peekAt;

  useEffect(() => {
    if (reduced) {
      shown.value = withTiming(1, { duration: duration.reduced });
      return;
    }
    shown.value = withDelay(
      peekAt,
      withTiming(1, { duration: wrongC.peekRise, easing: easing.pop }),
    );
  }, [shown, peekAt, reduced]);

  const style = useAnimatedStyle(() => ({
    opacity: Math.min(1, shown.value * 2),
    transform: [{ translateY: reduced ? 0 : wrongC.peekFrom * (1 - shown.value) }],
  }));

  return (
    <View pointerEvents="none" className="absolute -top-[48px] right-[12px]">
      <Animated.View style={style}>
        {/* The nod is the rig's own (vizi.wrong A), so the peek only rises. */}
        <Mascot moment="wrong" behavior="wrong" delay={peekAt} size={SIZE} decorative />
      </Animated.View>
    </View>
  );
}
