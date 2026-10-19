import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import type { CellState } from '@/components/ui';
import { Text } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useThemeColors, type ColorName } from '@/theme';

export type HexTone =
  'crystal' | 'nectar' | 'honey' | 'sealed' | 'empty' | 'err' | 'raised' | 'spot';

const tones: Record<HexTone, { fill: ColorName; ink: ColorName; text: string }> = {
  crystal: { fill: 'crystal', ink: 'crystal-ink', text: 'text-crystal-ink' },
  nectar: { fill: 'nectar', ink: 'on-nectar', text: 'text-on-nectar' },
  honey: { fill: 'honey', ink: 'on-honey', text: 'text-on-honey' },
  sealed: { fill: 'sealed', ink: 'on-sealed', text: 'text-on-sealed' },
  empty: { fill: 'wax', ink: 'lock-ink', text: 'text-lock-ink' },
  err: { fill: 'err-bg', ink: 'err', text: 'text-err' },
  raised: { fill: 'raised', ink: 'honey-text', text: 'text-honey-text' },
  spot: { fill: 'spot', ink: 'honey', text: 'text-honey' },
};

const CELL_TONES: Record<CellState, HexTone> = {
  not_started: 'empty',
  lesson_completed: 'nectar',
  mastered: 'honey',
  reinforced: 'sealed',
  needs_practice: 'crystal',
};

/** The hex colour of a mastery level (full fills, as the exam screens draw small cells). */
export const toneOfCell = (state: CellState): HexTone => CELL_TONES[state];

type HexTileProps = {
  tone: HexTone;
  /** Width in points; the pointy-top hexagon is 1.14× as tall (design 44×50, 34×38). */
  size: number;
  label?: string;
  /** An icon instead of a label; it receives the tone's ink colour. */
  icon?: (ink: ColorName) => ReactNode;
  className?: string;
};

/**
 * A small hexagon tile with a label or an icon: step types, topic numbers, nickname initials.
 * Decorative: the row around it names what it means.
 */
export function HexTile({ tone, size, label, icon, className }: HexTileProps) {
  const colors = useThemeColors();
  const style = tones[tone];
  const w = size;
  const h = Math.round(size * 1.14);
  const points = `${w / 2},0 ${w},${h * 0.25} ${w},${h * 0.75} ${w / 2},${h} 0,${h * 0.75} 0,${h * 0.25}`;

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className={cn('items-center justify-center', className)}
      // Size is a prop (tiles range from 32 to 44pt), so it cannot be a static className.
      style={{ width: w, height: h }}
    >
      <Svg width={w} height={h} style={{ position: 'absolute' }}>
        <Polygon points={points} fill={colors[style.fill]} />
      </Svg>
      {icon ? icon(style.ink) : null}
      {label ? (
        <Text className={cn('font-sans-black', w < 40 ? 'text-2xs' : 'text-xs', style.text)}>
          {label}
        </Text>
      ) : null}
    </View>
  );
}
