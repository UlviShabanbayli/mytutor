import { useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import Svg, { ClipPath, Defs, G, Polygon, Rect } from 'react-native-svg';
import { useThemeColors } from '@/theme';

type GiftBoxProps = {
  /** Width of the box in points (the lid is a little wider). */
  width: number;
  /** 0 closed … 1 open: the lid flies off, the box sinks and fades. */
  open: SharedValue<number>;
  /** The wiggle while it waits to be opened, in degrees. */
  wiggle: SharedValue<number>;
};

/** A honeycomb gift: a hexagon box with a ribbon and a lid (vizi.reward B). Decorative. */
export function GiftBox({ width, open, wiggle }: GiftBoxProps) {
  const c = useThemeColors();
  const id = `gb${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const h = width * 1.15;
  const k = width / 96;
  const points = `${width / 2},0 ${width},${h * 0.25} ${width},${h * 0.75} ${width / 2},${h} 0,${h * 0.75} 0,${h * 0.25}`;
  const box = useAnimatedStyle(() => {
    // The box sinks and fades in the second half of the opening (lab: 300ms from 0.3s).
    const sink = Math.max(0, (open.value - 0.4) / 0.6);
    return {
      opacity: 1 - sink,
      transform: [{ translateY: 10 * k * sink }, { rotate: `${wiggle.value}deg` }],
    };
  });
  const lid = useAnimatedStyle(() => ({
    opacity: 1 - open.value,
    transform: [
      { translateY: -60 * k * open.value },
      { rotate: `${wiggle.value - 25 * open.value}deg` },
    ],
  }));

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width, height: h + 8 * k }}
    >
      <Animated.View style={[{ marginTop: 8 * k }, box]}>
        <Svg width={width} height={h}>
          <Defs>
            <ClipPath id={id}>
              <Polygon points={points} />
            </ClipPath>
          </Defs>
          <G clipPath={`url(#${id})`}>
            <Rect x={0} y={0} width={width} height={h} fill={c['honey-deep']} />
            <Rect x={width / 2 - 8 * k} y={0} width={16 * k} height={h} fill={c.cap} />
          </G>
        </Svg>
      </Animated.View>
      <Animated.View
        style={[styles.lid, { left: -6 * k, width: width + 12 * k, height: 22 * k }, lid]}
      >
        <View className="flex-1 items-center overflow-hidden rounded-lg bg-cap">
          <View className="h-full bg-honey-deep" style={{ width: 16 * k }} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({ lid: { position: 'absolute', top: 0 } });
