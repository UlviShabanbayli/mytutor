import { View } from 'react-native';
import Svg, { ClipPath, Defs, G, Line, Polygon, Rect } from 'react-native-svg';
import { Icon, Text } from '@/components/ui';
import type { MasteryLevel } from '@/features/learn/types';
import { cn } from '@/lib/cn';
import { useThemeColors } from '@/theme';
import { hexPolygon } from './FlatHex';
import { levelInk, levelText } from './levelStyle';

type QueenCellProps = {
  level: MasteryLevel;
  /** Width in points; the queen cell is 1.45× taller than wide. */
  size: number;
  /** The word under the star ("SINAQ"); hidden on small cells. */
  word?: string;
  /** Offline and not on the phone: faded, with a download mark instead of the word. */
  dim?: boolean;
};

const CORNER = 0.19;

/**
 * "Ana arı hüceyrəsi": the unit test cell, taller than a topic cell, with a star instead of
 * a number. Same five fills as `HexCell` (proposal: a `queen` shape on the primitive).
 */
export function QueenCell({ level, size, word, dim = false }: QueenCellProps) {
  const c = useThemeColors();
  const w = size;
  const h = Math.round(size * 1.45);
  const outer = hexPolygon(w, h, CORNER);
  const fill = {
    not_started: c.wax,
    lesson_completed: c.wax,
    mastered: c.honey,
    reinforced: c.sealed,
    needs_practice: c.crystal,
  }[level];
  const clipId = `queen${w}`;
  const small = w < 30;

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className={cn('items-center justify-center', dim && 'opacity-40')}
      // Size is a prop: 11pt in a frame's strip, 54–68pt in a comb.
      style={{ width: w, height: h }}
    >
      <Svg width={w} height={h} style={{ position: 'absolute' }}>
        <Defs>
          <ClipPath id={clipId}>
            <Polygon points={outer} />
          </ClipPath>
        </Defs>
        <Polygon points={outer} fill={fill} />
        <G clipPath={`url(#${clipId})`}>
          {level === 'lesson_completed' ? (
            <Rect x={0} y={small ? 0 : h * 0.48} width={w} height={h} fill={c.nectar} />
          ) : null}
          {level === 'needs_practice' ? (
            <G stroke={c.surf} strokeWidth={1} opacity={0.6}>
              <Line x1={w * 0.2} y1={h * 0.3} x2={w * 0.5} y2={h * 0.55} />
              <Line x1={w * 0.5} y1={h * 0.55} x2={w * 0.8} y2={h * 0.35} />
            </G>
          ) : null}
        </G>
        {level === 'reinforced' ? (
          <Polygon points={hexPolygon(w, h, CORNER, w * 0.21, h * 0.22)} fill={c.cap} />
        ) : null}
      </Svg>
      {small ? null : (
        <View className="items-center gap-0.5">
          <Icon name="star" size={w < 60 ? 16 : 18} color={levelInk[level]} />
          {dim ? (
            <Icon name="download" size={16} color={levelInk[level]} />
          ) : word ? (
            <Text className={cn('font-sans-black text-[9px] tracking-[0.5px]', levelText[level])}>
              {word}
            </Text>
          ) : null}
        </View>
      )}
    </View>
  );
}
