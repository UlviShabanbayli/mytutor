import { View } from 'react-native';
import { HexCell, Text } from '@/components/ui';
import { placementResult } from '@/features/learn/hiveMotion';
import type { HiveUnit } from '@/features/learn/types';
import { useLandedCount } from '@/features/learn/useLandedCount';
import { useLearnText } from '@/features/learn/useLearnText';
import { cn } from '@/lib/cn';
import { Appear } from './Appear';
import { FlatHex } from './FlatHex';

type PlacementUnitRowProps = {
  unit: HiveUnit;
  knownIds: string[];
  startId: string | null;
  divider: boolean;
  /** When each filled mini cell fades in (by topic id) and when this unit's cells land. */
  cellAt: Record<string, number>;
  landAt: number[];
};

/**
 * One unit in the check's result: how many of its cells the check filled. The cells fill in
 * the screen's diagonal wave and the count ticks with them (hive.placement-result C); screen
 * readers get the final count.
 */
export function PlacementUnitRow({
  unit,
  knownIds,
  startId,
  divider,
  cellAt,
  landAt,
}: PlacementUnitRowProps) {
  const { t } = useLearnText();
  const filled = unit.topics.filter((x) => knownIds.includes(x.id)).length;
  const total = unit.topics.length;
  const full = filled === total;
  const landed = useLandedCount(landAt);
  const done = landed === filled;

  return (
    <View
      accessible
      accessibilityLabel={t('learn.result.unitAria', {
        number: unit.number,
        title: unit.title,
        filled,
        total,
      })}
      className={cn(
        'min-h-[50px] flex-row items-center gap-2.5 py-1.5',
        divider && 'border-t border-border',
      )}
    >
      <FlatHex size={28} color={done && full ? 'honey' : done && filled ? 'nectar' : 'wax'}>
        <Text
          className={cn(
            'font-sans-black text-xs',
            done && full ? 'text-on-honey' : done && filled ? 'text-on-nectar' : 'text-lock-ink',
          )}
        >
          {unit.number}
        </Text>
      </FlatHex>
      <View className="min-w-0 flex-1 gap-1">
        <Text numberOfLines={1} className="font-sans-black text-sm">
          {unit.title}
        </Text>
        <View className="flex-row gap-[3px]">
          {unit.topics.map((x) => {
            const state = knownIds.includes(x.id)
              ? 'mastered'
              : x.id === startId
                ? 'lesson_completed'
                : 'not_started';
            const at = cellAt[x.id];
            if (state === 'not_started' || at === undefined)
              return <HexCell key={x.id} size={14} state={state} />;
            // Wax underneath; the new level fades in over it (wax → honey).
            return (
              <View key={x.id}>
                <HexCell size={14} state="not_started" />
                <View className="absolute inset-0">
                  <Appear
                    from={{ opacity: 0 }}
                    delay={at}
                    duration={placementResult.fill}
                    ease="fill"
                  >
                    <HexCell size={14} state={state} />
                  </Appear>
                </View>
              </View>
            );
          })}
        </View>
      </View>
      <Text className={cn('font-sans-black text-sm', landed ? 'text-honey-text' : 'text-muted')}>
        {t('learn.hive.sub.count', { filled: landed, total })}
      </Text>
    </View>
  );
}
