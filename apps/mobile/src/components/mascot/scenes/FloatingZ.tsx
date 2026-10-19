import { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { ease } from '../rig/ease';

type FloatingZProps = {
  /** The mascot's size; the z rises from above its head. */
  size: number;
  /** Floating, or still (reduced motion). */
  moving: boolean;
  shown: boolean;
  /** Font size and sideways drift as shares of the mascot's size; start delay in ms. */
  font: number;
  drift: number;
  delay: number;
  /** Where the still z sits under reduced motion (shares of the size, from the start point). */
  still: readonly [number, number];
};

/** One "z" of a sleeping Vızı: fades in, floats up with a drift and a −12° turn, fades out (1.6s of every 2.4s). */
export function FloatingZ({ size, moving, shown, font, drift, delay, still }: FloatingZProps) {
  const p = useSharedValue(0);

  useEffect(() => {
    if (!moving) return;
    p.set(0);
    p.set(
      withDelay(delay, withRepeat(withTiming(1, { duration: 2400, easing: ease.none }), -1, false)),
    );
    return () => cancelAnimation(p);
  }, [moving, p, delay]);

  const style = useAnimatedStyle(() => {
    const f = Math.min(1, p.value / 0.667);
    const fadeIn = Math.min(1, f / 0.19);
    const fadeOut = f > 0.69 ? Math.max(0, 1 - (f - 0.69) / 0.31) : 1;
    const rise = Math.sin((f * Math.PI) / 2);
    if (!moving)
      return {
        opacity: shown ? 0.8 : 0,
        transform: [{ translateX: still[0] * size }, { translateY: still[1] * size }],
      };
    return {
      opacity: shown ? fadeIn * fadeOut : 0,
      transform: [
        { translateX: rise * size * drift },
        { translateY: -rise * size * 0.36 },
        { rotate: `${-12 * rise}deg` },
        { scale: 0.6 + 0.4 * fadeIn },
      ],
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.z, { left: size * 0.74, top: size * 0.04 }, style]}
    >
      <Text className="font-display-black text-crystal-ink" style={{ fontSize: size * font }}>
        z
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({ z: { position: 'absolute' } });
