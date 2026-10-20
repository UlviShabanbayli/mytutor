import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { ease } from '../rig/ease';

type AudioBarProps = {
  /** −1 while silent; a new number every 100ms while Vızı speaks. */
  tick: SharedValue<number>;
  height: number;
};

/** One bar of the voice meter: a new height (30–100%) every 100ms while Vızı speaks. */
export function AudioBar({ tick, height }: AudioBarProps) {
  const scale = useSharedValue(0.3);
  useAnimatedReaction(
    () => tick.value,
    (now, prev) => {
      if (now === prev) return;
      const to = now < 0 ? 0.3 : 0.3 + Math.random() * 0.7;
      scale.value = withTiming(to, { duration: now < 0 ? 200 : 100, easing: ease.none });
    },
  );
  const style = useAnimatedStyle(() => ({ transform: [{ scaleY: scale.value }] }));

  return (
    <Animated.View style={[styles.bar, { height }, style]}>
      <View className="flex-1 rounded-full bg-info" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({ bar: { width: 5 } });
