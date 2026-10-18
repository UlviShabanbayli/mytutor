import { View } from 'react-native';
import Svg, { ClipPath, Defs, G, Line, Polygon, Rect } from 'react-native-svg';
import { cn } from '@/lib/cn';
import { useThemeColors } from '@/theme';
import { Text } from './Text';

/**
 * Mastery level of a topic as the design draws it (code names from ADR 0001 + `reinforced`):
 * empty wax, half nectar while learning, full honey when mastered, a cap when reinforced,
 * crystal when it needs practice.
 */
export type CellState =
  'not_started' | 'lesson_completed' | 'mastered' | 'reinforced' | 'needs_practice';

type HexCellProps = {
  state: CellState;
  /** Width in points; height follows the pointy-top hexagon (×1.125, as in the design). */
  size?: number;
  /** Text inside the cell, e.g. the topic number "4.3". */
  label?: string;
  /** Draws a 3pt ring around the cell (the selected or current topic). */
  selected?: boolean;
  className?: string;
};

const textClass: Record<CellState, string> = {
  not_started: 'text-lock-ink',
  lesson_completed: 'text-on-nectar',
  mastered: 'text-on-honey',
  reinforced: 'text-on-sealed',
  needs_practice: 'text-crystal-ink',
};

/** Pointy-top hexagon in a w×h box (the design's clip-path polygon). */
function hexPoints(w: number, h: number, inset = 0) {
  const x0 = inset;
  const x1 = w - inset;
  const y0 = inset;
  const y1 = h - inset;
  const ih = y1 - y0;
  return [
    [w / 2, y0],
    [x1, y0 + ih * 0.25],
    [x1, y0 + ih * 0.75],
    [w / 2, y1],
    [x0, y0 + ih * 0.75],
    [x0, y0 + ih * 0.25],
  ]
    .map(([x, y]) => `${x},${y}`)
    .join(' ');
}

/** One topic cell. Decorative: the caller names the topic and its level for screen readers. */
export function HexCell({ state, size = 64, label, selected = false, className }: HexCellProps) {
  const c = useThemeColors();
  const w = size;
  const h = Math.round(size * 1.125);
  const outer = hexPoints(w, h);
  const fill = {
    not_started: c.wax,
    lesson_completed: c.wax,
    mastered: c.honey,
    reinforced: c.sealed,
    needs_practice: c.crystal,
  }[state];
  const clipId = `hex${w}`;

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className={cn('items-center justify-center', className)}
      // Size is a prop (cells range from 22 to 72pt), so it cannot be a static className.
      style={{ width: w, height: h }}
    >
      <Svg width={w} height={h} style={{ position: 'absolute' }}>
        <Defs>
          <ClipPath id={clipId}>
            <Polygon points={outer} />
          </ClipPath>
        </Defs>
        {/* Selected: the inverted `spot` color, never `ink` (it turns white in dark mode). */}
        <Polygon points={outer} fill={selected ? c.spot : fill} />
        <G clipPath={`url(#${clipId})`}>
          {state === 'lesson_completed' && !selected ? (
            // Small cells fill with nectar entirely, larger ones half-way up.
            <Rect x={0} y={w < 30 ? 0 : h / 2} width={w} height={h} fill={c.nectar} />
          ) : null}
          {state === 'needs_practice' && !selected ? (
            <G stroke={c.surf} strokeWidth={1} opacity={0.6}>
              <Line x1={w * 0.2} y1={h * 0.3} x2={w * 0.5} y2={h * 0.55} />
              <Line x1={w * 0.5} y1={h * 0.55} x2={w * 0.8} y2={h * 0.35} />
            </G>
          ) : null}
        </G>
        {state === 'reinforced' ? (
          <Polygon points={hexPoints(w, h, w * 0.19)} fill={selected ? c.honey : c.cap} />
        ) : null}
      </Svg>
      {label ? (
        <Text
          className={cn(
            'font-sans-black',
            w < 40 ? 'text-2xs' : 'text-sm',
            selected ? (state === 'reinforced' ? 'text-on-honey' : 'text-honey') : textClass[state],
          )}
        >
          {label}
        </Text>
      ) : null}
    </View>
  );
}
