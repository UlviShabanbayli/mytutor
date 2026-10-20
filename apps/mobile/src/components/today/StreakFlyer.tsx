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
import { controlThrough, quadPoint, type Point } from '@/components/feedback/motionMath';
import { streakC } from '@/components/feedback/timelines';
import { easing, useReducedMotionPref } from '@/motion';

const SIZE = 48;

type StreakFlyerProps = {
  /** The card she flies over, and today's hexagon in it (its centre). */
  card: { width: number; height: number };
  hex: Point;
};

/**
 * feedback.streak C: Vızı (flying) comes in from the left on a 1.2s arc that passes just above
 * today's hexagon, perches on the card's top-right corner and bobs once. Decorative; the only
 * Vızı on the screen. Less motion: she is simply perched.
 */
export function StreakFlyer({ card, hex }: StreakFlyerProps) {
  const reduced = useReducedMotionPref();
  const t = useSharedValue(reduced ? 1 : 0);
  const bob = useSharedValue(0);
  const start = { x: -70, y: card.height * 0.55 };
  const end = { x: card.width - SIZE / 2 - 6, y: 14 };
  const control = controlThrough(start, end, { x: hex.x, y: hex.y - 44 });

  useEffect(() => {
    if (reduced) return;
    const half = { duration: streakC.bobHalf, easing: easing.breathe };
    t.value = withDelay(
      streakC.startAt,
      withTiming(1, { duration: streakC.flight, easing: easing.breathe }),
    );
    bob.value = withDelay(
      streakC.startAt + streakC.bobAt,
      withSequence(withTiming(streakC.bob, half), withTiming(0, half)),
    );
  }, [reduced, t, bob]);

  const style = useAnimatedStyle(() => {
    const p = quadPoint(start, control, end, t.value);
    return {
      transform: [
        { translateX: p.x - SIZE / 2 },
        { translateY: p.y - SIZE / 2 + bob.value },
        { rotate: `${-8 + 14 * t.value}deg` },
      ],
    };
  });

  return (
    <View pointerEvents="none" className="absolute left-0 top-0">
      <Animated.View style={style}>
        <Mascot mood="ucur" size={SIZE} decorative />
      </Animated.View>
    </View>
  );
}
