import { View } from 'react-native';
import { HandoffTarget } from '@/components/handoff/HandoffTarget';
import { HoneyGain } from '@/components/learn/HoneyGain';
import { HexCell, Icon, Text, type CellState } from '@/components/ui';
import { useHandoffArrival } from '@/features/transitions/useHandoffArrival';
import { cn } from '@/lib/cn';
import { NectarRise } from './NectarRise';

type CellChangeProps = {
  code: string;
  from: CellState;
  to: CellState;
  /** Spoken summary: "4.3 hüceyrəsi: Boş idi, indi Nektar — Öyrənilir". */
  accessibilityLabel: string;
  /** Under the small cell ("Boş"); omitted on the result card. */
  fromLabel?: string;
  title: string;
  caption: string;
  /** `honey`: on the honey "Dərs bitdi" page; `card`: a white card on the result. */
  tone: 'honey' | 'card';
  /** The new cell fills with nectar under a moving wave as it appears (feedback.lessondone B). */
  rising?: boolean;
  /** Honey won with the change: a "+N bal" chip rises beside a cell that turns honey. */
  points?: number;
};

/**
 * A topic cell moving up a level: the old cell, an arrow, the new bigger cell and its name. The
 * new cell plays the hive's level change from `from` (hive.fill-nectar A, hive.nectar-honey C),
 * unless the test's handoff already brought it here changed (transitions.handoff B).
 */
export function CellChange({
  code,
  from,
  to,
  accessibilityLabel,
  fromLabel,
  title,
  caption,
  tone,
  rising = false,
  points,
}: CellChangeProps) {
  const honey = tone === 'honey';
  const size = honey ? 92 : 72;
  const { flown, landed } = useHandoffArrival(code);
  const gain = to === 'mastered' && from !== 'mastered' && points !== undefined && landed;

  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel}
      className={cn(
        'flex-row items-center gap-3 rounded-xl px-3.5 py-3',
        // White at 45% over honey: the design's one allowed overlay on honey backgrounds.
        honey ? 'justify-center bg-white/45' : 'border border-border bg-surf',
      )}
    >
      <View className="items-center gap-1">
        <HexCell state={from} size={honey ? 52 : 44} label={code} />
        {fromLabel ? (
          <Text className="font-sans-bold text-xs text-on-honey">{fromLabel}</Text>
        ) : null}
      </View>
      <Icon name="chevron" size={honey ? 24 : 20} color={honey ? 'on-honey' : 'muted'} />
      {/* transitions.handoff B: a test's topic cell lands here. */}
      <HandoffTarget code={code}>
        {rising && to === 'lesson_completed' ? (
          <NectarRise size={size} label={code} />
        ) : (
          <HexCell state={to} size={size} label={code} animateFrom={flown ? undefined : from} />
        )}
      </HandoffTarget>
      <View className={cn('gap-0.5', honey ? '' : 'min-w-0 flex-1')}>
        <Text className={cn('font-sans-black text-md', honey && 'text-on-honey')}>{title}</Text>
        <Text className={cn('text-sm', honey ? 'font-sans-bold text-on-honey' : 'text-muted')}>
          {caption}
        </Text>
        {gain ? (
          // After a handoff the chip rises as the cell lands; the flight played the success cue.
          <View className="mt-1">
            <HoneyGain points={points} delay={flown ? 0 : undefined} cue={!flown} />
          </View>
        ) : null}
      </View>
    </View>
  );
}
