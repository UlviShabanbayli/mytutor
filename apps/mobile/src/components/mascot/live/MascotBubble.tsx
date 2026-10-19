import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Text } from '@/components/ui/Text';
import { duration } from '@/motion';
import { ease } from '../rig/ease';

type MascotBubbleProps = {
  text: string | null;
  /** The mascot's size: the bubble sits by its head. */
  size: number;
  reduced: boolean;
};

/**
 * What Vızı says, in a speech bubble beside its head (motion lab `.m-vizi-bubble`): pops in with
 * back.out(2.2) in 260ms, fades away in 180ms. Read out politely by screen readers.
 */
export function MascotBubble({ text, size, reduced }: MascotBubbleProps) {
  // The last line stays written while the bubble fades away.
  const [shown, setShown] = useState(text);
  if (text && text !== shown) setShown(text);
  const show = useSharedValue(0);

  useEffect(() => {
    if (text) {
      show.set(0);
      show.set(withTiming(1, { duration: reduced ? duration.reduced : 260, easing: ease.back22 }));
    } else {
      show.set(withTiming(0, { duration: reduced ? duration.reduced : 180 }));
    }
  }, [text, reduced, show]);

  const style = useAnimatedStyle(() => ({
    opacity: Math.min(1, show.value),
    transform: [
      { translateY: reduced ? 0 : (1 - show.value) * 6 },
      { scale: reduced ? 1 : 0.86 + 0.14 * show.value },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.bubble, { left: size * 0.86, top: size * 0.08 }, style]}
    >
      <View
        accessibilityRole="text"
        accessibilityLiveRegion="polite"
        className="rounded-2xl border border-border bg-surf px-3 py-2"
      >
        <Text className="font-sans-bold text-sm">{shown ?? ''}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bubble: { position: 'absolute', maxWidth: 190, transformOrigin: 'left center' },
});
