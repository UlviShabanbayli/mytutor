import { View } from 'react-native';
import { HandoffTarget } from '@/components/handoff/HandoffTarget';
import { HexCell, Icon, Text, type CellState } from '@/components/ui';
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
  /** The new cell fills with nectar as it appears (feedback.lessondone B). */
  rising?: boolean;
};

/** A topic cell moving up a level: the old cell, an arrow, the new bigger cell and its name. */
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
}: CellChangeProps) {
  const honey = tone === 'honey';
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
      {rising && to === 'lesson_completed' ? (
        <NectarRise size={honey ? 92 : 72} label={code} />
      ) : (
        <HexCell state={to} size={honey ? 92 : 72} label={code} />
      )}
      <View className={cn('gap-0.5', honey ? '' : 'min-w-0 flex-1')}>
        <Text className={cn('font-sans-black text-md', honey && 'text-on-honey')}>{title}</Text>
        <Text className={cn('text-sm', honey ? 'font-sans-bold text-on-honey' : 'text-muted')}>
          {caption}
        </Text>
      </View>
    </View>
  );
}
