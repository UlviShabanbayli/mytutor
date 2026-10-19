import { View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import Svg, { Polygon } from 'react-native-svg';
import { HexCell, Icon, Text } from '@/components/ui';
import { cellMotionKind, cellTimeline } from '@/components/ui/hex/levelChange';
import { LevelSwap } from '@/components/ui/hex/LevelSwap';
import type { MasteryLevel } from '@/features/learn/types';
import { useBreath } from '@/features/learn/useBreath';
import { cn } from '@/lib/cn';
import { useReducedMotionPref } from '@/motion';
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
  /** The level last seen: the cell plays the change to `level` once (see `HexCell`). */
  animateFrom?: MasteryLevel;
  /** The old level's word, cross-faded to `word` with the change. */
  fromWord?: string;
  /** "Sən buradasan": the ring breathes three times, then rests (hive.current-pulse A). */
  pulse?: boolean;
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
  animateFrom,
  fromWord,
  pulse = false,
}: TopicCellProps) {
  const c = useThemeColors();
  const reduced = useReducedMotionPref();
  const h = Math.round(size * 1.125);
  const inner = ring ? size - RING * 2 : size;
  const kind = animateFrom && !reduced ? cellMotionKind(animateFrom, level) : null;
  const breath = useBreath(pulse && ring);
  const ringStyle = useAnimatedStyle(() => ({ opacity: 1 - 0.55 * breath.value }));
  const bodyStyle = useAnimatedStyle(() => ({ transform: [{ scale: 1 + 0.035 * breath.value }] }));

  const ink = (shown: MasteryLevel, shownWord: string | undefined) => (
    <>
      {number ? (
        <Text className={cn('font-display-black', numberClass[numberSize], levelText[shown])}>
          {number}
        </Text>
      ) : null}
      {dim ? (
        <Icon name="download" size={16} color={levelInk[shown]} />
      ) : shownWord ? (
        <Text
          className={cn(
            'font-sans-black tracking-[0.5px]',
            numberSize === 'lg' ? 'text-2xs' : 'text-[9px]',
            levelText[shown],
          )}
        >
          {shownWord}
        </Text>
      ) : null}
    </>
  );

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className={cn('items-center justify-center', dim && 'opacity-40')}
      // Cell size is a prop (from 42 in search rows to 92 on the topic page).
      style={{ width: size, height: h }}
    >
      {ring ? (
        <View className="absolute inset-0">
          <Animated.View style={ringStyle}>
            <Svg width={size} height={h}>
              <Polygon points={hexPolygon(size, h)} fill={c['honey-deep']} />
            </Svg>
          </Animated.View>
        </View>
      ) : null}
      <Animated.View style={bodyStyle}>
        <HexCell state={level} size={inner} animateFrom={kind ? animateFrom : undefined} />
      </Animated.View>
      <View className="absolute inset-0 items-center justify-center gap-px">
        {kind && animateFrom ? (
          <LevelSwap
            key={`${animateFrom}-${level}`}
            at={cellTimeline[kind].swap}
            before={ink(animateFrom, fromWord)}
            after={ink(level, word)}
          />
        ) : (
          ink(level, word)
        )}
      </View>
    </View>
  );
}
