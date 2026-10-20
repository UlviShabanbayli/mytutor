import type { ReactNode } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

type RisingFillProps = {
  width: number;
  height: number;
  /** 0 (empty) to 1 (full): how much of `children` shows, from the bottom up. */
  level: SharedValue<number>;
  /** The full fill, drawn in a width×height box (e.g. a honey hexagon). */
  children: ReactNode;
};

/**
 * Reveals its content from the bottom up, like honey rising in a cell: a window slides up while
 * the content slides down by the same amount, so the fill keeps its shape (a hexagon, a drop)
 * and only transforms animate. Decorative and absolutely placed over its parent's top-left.
 */
export function RisingFill({ width, height, level, children }: RisingFillProps) {
  const windowStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: height * (1 - level.value) }],
  }));
  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -height * (1 - level.value) }],
  }));

  return (
    <View
      pointerEvents="none"
      className="absolute left-0 top-0 overflow-hidden"
      // Sizes come from the caller's cell.
      style={{ width, height }}
    >
      {/* Animated views take no className, so the window's clip is a style. */}
      <Animated.View style={[{ width, height, overflow: 'hidden' }, windowStyle]}>
        <Animated.View style={[{ width, height }, contentStyle]}>{children}</Animated.View>
      </Animated.View>
    </View>
  );
}
