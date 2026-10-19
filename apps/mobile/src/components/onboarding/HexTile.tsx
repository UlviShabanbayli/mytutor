import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import { cn } from '@/lib/cn';
import { useThemeColors, type ColorName } from '@/theme';

/** Pointy-top hexagon points in a w×h box, inset by `inset` on every side. */
function hexPoints(w: number, h: number, inset = 0) {
  const top = inset;
  const bottom = h - inset;
  const left = inset;
  const right = w - inset;
  const ih = bottom - top;
  return [
    [w / 2, top],
    [right, top + ih * 0.25],
    [right, top + ih * 0.75],
    [w / 2, bottom],
    [left, top + ih * 0.75],
    [left, top + ih * 0.25],
  ]
    .map(([x, y]) => `${x},${y}`)
    .join(' ');
}

type HexTileProps = {
  /** Width in points; height follows the design's hexagon (×1.125). */
  size: number;
  fill: ColorName;
  /** An outer ring in this color, `ringWidth` thick (the honeycomb grade cells). */
  ring?: ColorName;
  ringWidth?: number;
  /** Raw fill for the splash's white glints on honey (design rule: rgba white overlays). */
  rawFill?: string;
  children?: ReactNode;
  className?: string;
};

/** A hexagon tile with centred content: icon tiles, step numbers, the honeycomb. */
export function HexTile({
  size,
  fill,
  ring,
  ringWidth = 3,
  rawFill,
  children,
  className,
}: HexTileProps) {
  const c = useThemeColors();
  const w = size;
  const h = Math.round(size * 1.125);

  return (
    <View
      className={cn('items-center justify-center', className)}
      // Size is a prop (tiles range from 14 to 82pt), so it cannot be a static className.
      style={{ width: w, height: h }}
    >
      <Svg width={w} height={h} style={{ position: 'absolute' }}>
        {ring ? <Polygon points={hexPoints(w, h)} fill={c[ring]} /> : null}
        <Polygon points={hexPoints(w, h, ring ? ringWidth : 0)} fill={rawFill ?? c[fill]} />
      </Svg>
      {children}
    </View>
  );
}
