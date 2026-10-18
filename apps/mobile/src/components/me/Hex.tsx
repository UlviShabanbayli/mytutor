import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import { cn } from '@/lib/cn';
import { useThemeColors, type ColorName } from '@/theme';

type HexProps = {
  /** Width in points; the pointy-top hexagon is ×1.13 as tall (design 60×68, 42×48). */
  width: number;
  fill: ColorName;
  /** A smaller hexagon inside (the "cap" of a sealed cell, a ring around an initial). */
  inner?: { fill: ColorName; inset: number };
  children?: ReactNode;
  className?: string;
};

function points(w: number, h: number, inset = 0) {
  const top = inset;
  const bottom = h - inset;
  const ih = bottom - top;
  return [
    [w / 2, top],
    [w - inset, top + ih * 0.25],
    [w - inset, top + ih * 0.75],
    [w / 2, bottom],
    [inset, top + ih * 0.75],
    [inset, top + ih * 0.25],
  ]
    .map(([x, y]) => `${x},${y}`)
    .join(' ');
}

/**
 * The design's hexagon tile for avatars, badges, ranks and class marks. Decorative: the row it
 * sits in carries the accessible name.
 */
export function Hex({ width, fill, inner, children, className }: HexProps) {
  const c = useThemeColors();
  const height = Math.round(width * 1.13);

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className={cn('items-center justify-center', className)}
      // The size is a prop (tiles range from 18 to 64pt), so it cannot be a static className.
      style={{ width, height }}
    >
      <View className="absolute inset-0">
        <Svg width={width} height={height}>
          <Polygon points={points(width, height)} fill={c[fill]} />
          {inner ? (
            <Polygon points={points(width, height, inner.inset)} fill={c[inner.fill]} />
          ) : null}
        </Svg>
      </View>
      {children}
    </View>
  );
}
