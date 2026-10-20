import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import Svg, { Polygon } from 'react-native-svg';
import { useThemeColors } from '@/theme';

type ScoutRingProps = {
  /** Centre of the found cell and the ring's box, in points. */
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: SharedValue<number>;
  scale: SharedValue<number>;
};

/** The hexagon ring that pulses around the weak cell Vızı found (vizi.scout A). */
export function ScoutRing({ x, y, width, height, opacity, scale }: ScoutRingProps) {
  const c = useThemeColors();
  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.ring, { left: x - width / 2, top: y - height / 2, width, height }, style]}
    >
      <Svg width={width} height={height} viewBox="0 0 74 84" preserveAspectRatio="none">
        <Polygon
          points="37,2 72,22 72,62 37,82 2,62 2,22"
          fill="none"
          stroke={c['crystal-ink']}
          strokeWidth={3}
          strokeLinejoin="round"
        />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({ ring: { position: 'absolute' } });
