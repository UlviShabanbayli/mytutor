import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import Animated, {
  Keyframe,
  LayoutAnimationConfig,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Text } from '@/components/ui';
import { duration, easing, spring, useReducedMotionPref } from '@/motion';

/** micro.badge B: a new count slides up into the badge, the old one slides out above it. */
const countIn = new Keyframe({
  0: { opacity: 0, transform: [{ translateY: 9 }] },
  100: { opacity: 1, transform: [{ translateY: 0 }], easing: easing.enter },
}).duration(duration.base);
const countOut = new Keyframe({
  0: { opacity: 1, transform: [{ translateY: 0 }] },
  100: { opacity: 0, transform: [{ translateY: -9 }] },
}).duration(duration.leave);
/** The read badge shrinks away. */
const badgeOut = new Keyframe({
  0: { opacity: 1, transform: [{ scale: 1 }] },
  100: { opacity: 0, transform: [{ scale: 0.4 }], easing: easing.away },
}).duration(duration.leave);

type TabBadgeProps = {
  count: number | undefined;
  /** Bumps the tab icon when a count arrives or grows. */
  onArrive: () => void;
};

/**
 * The red unread count on a tab icon (micro.badge B): it springs in from nothing (peak ≈1.2),
 * pops when the count changes and shrinks away once read. Decorative: the tab's label says the
 * count. With reduced motion it simply appears and disappears.
 */
export function TabBadge({ count, onArrive }: TabBadgeProps) {
  const reduced = useReducedMotionPref();
  const scale = useSharedValue(count ? 1 : 0);
  const last = useRef(count ?? 0);

  useEffect(() => {
    const n = count ?? 0;
    const before = last.current;
    last.current = n;
    if (n === before) return;
    if (n === 0) {
      // Ready for the next arrival once the read badge has left.
      scale.set(withDelay(duration.leave, withTiming(0, { duration: 0 })));
      return;
    }
    if (reduced) {
      scale.set(1);
      return;
    }
    scale.set(
      before === 0
        ? withSequence(withTiming(0, { duration: 0 }), withSpring(1, spring.badge))
        : withSequence(
            withTiming(1.15, { duration: duration.hop, easing: easing.press }),
            withSpring(1, spring.badge),
          ),
    );
    if (n > before) onArrive();
  }, [count, reduced, scale, onArrive]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  // The positioned box stays mounted so the badge inside can play its exit.
  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className="absolute -top-[3px] right-1.5"
    >
      {count ? (
        <Animated.View exiting={reduced ? undefined : badgeOut}>
          {/* The first count arrives with the badge's spring; later ones slide in. */}
          <LayoutAnimationConfig skipEntering>
            <Animated.View style={style}>
              <View className="h-[18px] min-w-[18px] items-center justify-center overflow-hidden rounded-full border-2 border-surf bg-err px-1">
                <Animated.View
                  key={count}
                  entering={reduced ? undefined : countIn}
                  exiting={reduced ? undefined : countOut}
                >
                  <Text className="font-sans-black text-2xs text-surf">{count}</Text>
                </Animated.View>
              </View>
            </Animated.View>
          </LayoutAnimationConfig>
        </Animated.View>
      ) : null}
    </View>
  );
}
