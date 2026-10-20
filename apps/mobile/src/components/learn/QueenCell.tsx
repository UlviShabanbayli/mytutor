import { View } from 'react-native';
import { Icon, Text } from '@/components/ui';
import { CellArt } from '@/components/ui/hex/CellArt';
import { cellMotionKind } from '@/components/ui/hex/levelChange';
import { CellMotion } from '@/components/ui/hex/CellMotion';
import { cellGeometry } from '@/components/ui/hex/geometry';
import type { MasteryLevel } from '@/features/learn/types';
import { cn } from '@/lib/cn';
import { useReducedMotionPref } from '@/motion';
import { levelInk, levelText } from './levelStyle';

type QueenCellProps = {
  level: MasteryLevel;
  /** Width in points; the queen cell is 1.45× taller than wide. */
  size: number;
  /** The word under the star ("SINAQ"); hidden on small cells. */
  word?: string;
  /** Offline and not on the phone: faded, with a download mark instead of the word. */
  dim?: boolean;
  /**
   * The level before: plays the approved change to `level` once (the unit-done page seals
   * the queen this way). Silent: the screen plays its own cue.
   */
  animateFrom?: MasteryLevel;
  animationDelay?: number;
};

/** Where the queen's long sides start and end (19% / 81% of its height). */
const CORNER = 0.19;

/**
 * "Ana arı hüceyrəsi": the unit test cell, taller than a topic cell, with a star instead of
 * a number. Same five fills as `HexCell` (proposal: a `queen` shape on the primitive).
 */
export function QueenCell({
  level,
  size,
  word,
  dim = false,
  animateFrom,
  animationDelay = 0,
}: QueenCellProps) {
  const reduced = useReducedMotionPref();
  const w = size;
  const h = Math.round(size * 1.45);
  const small = w < 30;
  const geo = cellGeometry(w, h, {
    corner: CORNER,
    nectarTop: small ? 0 : h * 0.48,
    clipId: `queen${w}`,
  });
  const from = animateFrom && !reduced ? animateFrom : undefined;
  const kind = from ? cellMotionKind(from, level) : null;

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className={cn('items-center justify-center', dim && 'opacity-40')}
      // Size is a prop: 11pt in a frame's strip, 54–68pt in a comb.
      style={{ width: w, height: h }}
    >
      {from && kind ? (
        <CellMotion geo={geo} kind={kind} from={from} to={level} delay={animationDelay} quiet />
      ) : (
        <CellArt geo={geo} state={level} />
      )}
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
