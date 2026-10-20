import { View } from 'react-native';
import Animated, { type SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { PULL_THRESHOLD, pullProgress } from '@/features/transitions/pull';
import { Mascot } from '../mascot/Mascot';

type RefreshViziProps = {
  pull: SharedValue<number>;
  /** 0–1 while she hovers during the refresh. */
  hover: SharedValue<number>;
  /** 0–1 as she flies off when it is done. */
  leave: SharedValue<number>;
  reduced: boolean;
};

/**
 * transitions.refresh B: Vızı (ucur) comes down with the pull and straightens up (−10° → 0),
 * hovers ±3pt while the list reloads, then flies 40pt up as she fades. With less motion she
 * only fades in and out. Decorative: the screen reader hears the refresh as text.
 */
export function RefreshVizi({ pull, hover, leave, reduced }: RefreshViziProps) {
  const slot = useAnimatedStyle(() => ({
    transform: [{ translateY: Math.min(pull.get(), PULL_THRESHOLD) - PULL_THRESHOLD }],
  }));
  const vizi = useAnimatedStyle(() => {
    const c = pullProgress(pull.get());
    const away = leave.get();
    if (reduced) return { opacity: (c > 0.2 ? 1 : 0) * (1 - away) };
    return {
      opacity: c * (1 - away),
      transform: [
        { translateY: -12 + 12 * c - 40 * away + (hover.get() * 2 - 1) * 3 * Math.min(1, c) },
        { rotate: `${-10 + 10 * c}deg` },
      ],
    };
  });

  return (
    <Animated.View pointerEvents="none" style={slot}>
      <View className="h-14 items-center justify-center">
        <Animated.View style={vizi}>
          <Mascot mood="ucur" size={44} decorative />
        </Animated.View>
      </View>
    </Animated.View>
  );
}
