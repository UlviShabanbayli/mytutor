import { View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import { Text } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useThemeColors } from '@/theme';

/** honey: a linked child; wax: not linked yet; info: a teacher; raised: the parent. */
type HexTone = 'honey' | 'wax' | 'info' | 'raised';

const fills = { honey: 'honey', wax: 'wax', info: 'info-bg', raised: 'raised' } as const;
const inks = {
  honey: 'text-on-honey',
  wax: 'text-lock-ink',
  info: 'text-info',
  raised: 'text-honey-text',
} as const;

type HexAvatarProps = {
  /** The first letter is shown; the name itself is read by the text next to it. */
  name: string;
  tone: HexTone;
  size?: number;
};

/** A person's initial on a hexagon (design avatars: N, E, L, S). Decorative. */
export function HexAvatar({ name, tone, size = 48 }: HexAvatarProps) {
  const colors = useThemeColors();
  const w = size;
  const h = Math.round(size * 1.13);
  const points = `${w / 2},0 ${w},${h * 0.25} ${w},${h * 0.75} ${w / 2},${h} 0,${h * 0.75} 0,${h * 0.25}`;

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className="items-center justify-center"
      // The size is a prop (36–48pt in the design), so it cannot be a static className.
      style={{ width: w, height: h }}
    >
      <Svg width={w} height={h} style={{ position: 'absolute' }}>
        <Polygon points={points} fill={colors[fills[tone]]} />
      </Svg>
      <Text className={cn('font-display-black', size >= 44 ? 'text-lg' : 'text-sm', inks[tone])}>
        {name.trim().charAt(0).toLocaleUpperCase('az')}
      </Text>
    </View>
  );
}
