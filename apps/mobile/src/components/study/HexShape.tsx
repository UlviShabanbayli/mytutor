import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import { type ColorName, useThemeColors } from '@/theme';

type HexShapeProps = {
  /** Width in points; the pointy-top hexagon is 1.15× as tall (the design's ratio). */
  size: number;
  color: ColorName;
  children?: ReactNode;
};

/** A plain hexagon behind its content: review dots and the ring around a crystal cell. */
export function HexShape({ size, color, children }: HexShapeProps) {
  const c = useThemeColors();
  const h = Math.round(size * 1.15);
  return (
    // Size comes from the caller, so it cannot be a static class.
    <View className="items-center justify-center" style={{ width: size, height: h }}>
      <Svg width={size} height={h} style={{ position: 'absolute' }}>
        <Polygon
          points={`${size / 2},0 ${size},${h * 0.25} ${size},${h * 0.75} ${size / 2},${h} 0,${h * 0.75} 0,${h * 0.25}`}
          fill={c[color]}
        />
      </Svg>
      {children}
    </View>
  );
}
