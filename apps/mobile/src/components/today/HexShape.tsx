import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import { useThemeColors, type ColorName } from '@/theme';

type HexShapeProps = {
  width: number;
  height: number;
  fill: ColorName;
  /** Centered on the hexagon: a smaller hexagon, an icon or a short label. */
  children?: ReactNode;
};

/**
 * A plain pointy-top hexagon in any token color (week days, inbox badges, plan icons). Topic
 * cells with a mastery level use `HexCell`. Decorative: callers label the meaning.
 */
export function HexShape({ width, height, fill, children }: HexShapeProps) {
  const colors = useThemeColors();
  const points = [
    [width / 2, 0],
    [width, height * 0.25],
    [width, height * 0.75],
    [width / 2, height],
    [0, height * 0.75],
    [0, height * 0.25],
  ]
    .map(([x, y]) => `${x},${y}`)
    .join(' ');

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className="items-center justify-center"
      // Size is a prop (cells from 22 to 44pt), so it cannot be a static className.
      style={{ width, height }}
    >
      <Svg width={width} height={height} style={{ position: 'absolute' }}>
        <Polygon points={points} fill={colors[fill]} />
      </Svg>
      {children}
    </View>
  );
}
