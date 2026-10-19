import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import { Text } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useThemeColors } from '@/theme';

export type HexTone = 'honey' | 'wax' | 'raised' | 'spot';

const fills = { honey: 'honey', wax: 'wax', raised: 'raised', spot: 'spot' } as const;
const inks: Record<HexTone, string> = {
  honey: 'text-on-honey',
  wax: 'text-ink',
  raised: 'text-honey-text',
  spot: 'text-honey',
};

type HexBadgeProps = {
  /** Width in points; the pointy-top hexagon is 1.14× taller, as in the design. */
  size: number;
  tone?: HexTone;
  /** Initials or a short class name; decorative, the caller names the person nearby. */
  label?: string;
  labelClassName?: string;
  children?: ReactNode;
};

/** A hexagon with centred initials: students, classes and the teacher (design `hx`). */
export function HexBadge({ size, tone = 'wax', label, labelClassName, children }: HexBadgeProps) {
  const colors = useThemeColors();
  const w = size;
  const h = Math.round(size * 1.14);
  const points = `${w / 2},0 ${w},${h * 0.25} ${w},${h * 0.75} ${w / 2},${h} 0,${h * 0.75} 0,${h * 0.25}`;

  return (
    <View
      aria-hidden
      className="items-center justify-center"
      // The size is a prop, so it cannot be a static className.
      style={{ width: w, height: h }}
    >
      <Svg width={w} height={h} style={{ position: 'absolute' }}>
        <Polygon points={points} fill={colors[fills[tone]]} />
      </Svg>
      {label ? (
        <Text
          className={cn(
            'font-sans-black',
            w < 40 ? 'text-xs' : 'text-sm',
            inks[tone],
            labelClassName,
          )}
        >
          {label}
        </Text>
      ) : null}
      {children}
    </View>
  );
}
