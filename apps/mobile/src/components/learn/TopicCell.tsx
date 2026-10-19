import { View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import { HexCell, Icon, Text } from '@/components/ui';
import type { MasteryLevel } from '@/features/learn/types';
import { cn } from '@/lib/cn';
import { useThemeColors } from '@/theme';
import { hexPolygon } from './FlatHex';
import { levelInk, levelText } from './levelStyle';

type TopicCellProps = {
  level: MasteryLevel;
  /** Topic number, e.g. "4.3". */
  number?: string;
  /** The level word under the number ("NEKTAR"); omitted on small cells. */
  word?: string;
  /** Width in points (the hive's comb uses 68). */
  size: number;
  /** A honey-deep ring: the current topic, or the one a sheet is about. */
  ring?: boolean;
  /** Offline and not on the phone: faded, with a download mark instead of the word. */
  dim?: boolean;
  /** Number size: `lg` on the topic page's hero cell. */
  numberSize?: 'sm' | 'md' | 'lg';
};

const RING = 4;
const numberClass = { sm: 'text-xs', md: 'text-base', lg: 'text-xl' };

/**
 * A topic as a mastery cell: `HexCell` for the fill, with the number and the level's word on
 * top. Decorative; the pressable around it names the topic and level.
 */
export function TopicCell({
  level,
  number,
  word,
  size,
  ring = false,
  dim = false,
  numberSize = 'md',
}: TopicCellProps) {
  const c = useThemeColors();
  const h = Math.round(size * 1.125);
  const inner = ring ? size - RING * 2 : size;

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className={cn('items-center justify-center', dim && 'opacity-40')}
      // Cell size is a prop (from 42 in search rows to 92 on the topic page).
      style={{ width: size, height: h }}
    >
      {ring ? (
        <Svg width={size} height={h} style={{ position: 'absolute' }}>
          <Polygon points={hexPolygon(size, h)} fill={c['honey-deep']} />
        </Svg>
      ) : null}
      <HexCell state={level} size={inner} />
      <View className="absolute inset-0 items-center justify-center gap-px">
        {number ? (
          <Text className={cn('font-display-black', numberClass[numberSize], levelText[level])}>
            {number}
          </Text>
        ) : null}
        {dim ? (
          <Icon name="download" size={16} color={levelInk[level]} />
        ) : word ? (
          <Text
            className={cn(
              'font-sans-black tracking-[0.5px]',
              numberSize === 'lg' ? 'text-2xs' : 'text-[9px]',
              levelText[level],
            )}
          >
            {word}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
