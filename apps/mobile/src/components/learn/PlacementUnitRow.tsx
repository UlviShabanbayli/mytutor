import { View } from 'react-native';
import { HexCell, Text } from '@/components/ui';
import type { HiveUnit } from '@/features/learn/types';
import { useLearnText } from '@/features/learn/useLearnText';
import { cn } from '@/lib/cn';
import { FlatHex } from './FlatHex';

type PlacementUnitRowProps = {
  unit: HiveUnit;
  knownIds: string[];
  startId: string | null;
  divider: boolean;
};

/** One unit in the check's result: how many of its cells the check filled. */
export function PlacementUnitRow({ unit, knownIds, startId, divider }: PlacementUnitRowProps) {
  const { t } = useLearnText();
  const filled = unit.topics.filter((x) => knownIds.includes(x.id)).length;
  const total = unit.topics.length;
  const full = filled === total;

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
      <FlatHex size={28} color={full ? 'honey' : filled ? 'nectar' : 'wax'}>
        <Text
          className={cn(
            'font-sans-black text-xs',
            full ? 'text-on-honey' : filled ? 'text-on-nectar' : 'text-lock-ink',
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
          {unit.topics.map((x) => (
            <HexCell
              key={x.id}
              size={14}
              state={
                knownIds.includes(x.id)
                  ? 'mastered'
                  : x.id === startId
                    ? 'lesson_completed'
                    : 'not_started'
              }
            />
          ))}
        </View>
      </View>
      <Text className={cn('font-sans-black text-sm', filled ? 'text-honey-text' : 'text-muted')}>
        {t('learn.hive.sub.count', { filled, total })}
      </Text>
    </View>
  );
}
