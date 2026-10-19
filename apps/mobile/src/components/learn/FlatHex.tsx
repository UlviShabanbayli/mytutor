import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import { cn } from '@/lib/cn';
import { type ColorName, useThemeColors } from '@/theme';

type FlatHexProps = {
  /** Width in points; height is width × 1.14 (the design's 44×50 and 36×40 badges). */
  size: number;
  color: ColorName;
  /** Taller "queen" shape for unit tests (side corners at 19% instead of 25%). */
  queen?: boolean;
  children?: ReactNode;
  className?: string;
};

/** Pointy-top points of a w×h hexagon inset by (dx, dy); `corner` is where the sides start. */
export function hexPolygon(w: number, h: number, corner = 0.25, dx = 0, dy = dx) {
  const ih = h - dy * 2;
  return [
    [w / 2, dy],
    [w - dx, dy + ih * corner],
    [w - dx, dy + ih * (1 - corner)],
    [w / 2, dy + ih],
    [dx, dy + ih * (1 - corner)],
    [dx, dy + ih * corner],
  ]
    .map(([x, y]) => `${x},${y}`)
    .join(' ');
}

/**
 * A one-color hexagon badge with content in the middle (step numbers, monograms, icons).
 * Mastery cells use `HexCell`; this is for the design's plain hex badges. Decorative.
 */
export function FlatHex({ size, color, queen = false, children, className }: FlatHexProps) {
  const colors = useThemeColors();
  const w = size;
  const h = Math.round(size * (queen ? 1.45 : 1.14));

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className={cn('items-center justify-center', className)}
      // Size comes from the prop (badges range from 10 to 54pt).
      style={{ width: w, height: h }}
    >
      <Svg width={w} height={h} style={{ position: 'absolute' }}>
        <Polygon points={hexPolygon(w, h, queen ? 0.19 : 0.25)} fill={colors[color]} />
      </Svg>
      {children}
    </View>
  );
}
