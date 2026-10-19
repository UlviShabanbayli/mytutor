import { View } from 'react-native';
import { Text } from '@/components/ui';
import type { HiveTopic } from '@/features/learn/types';
import { listJoin } from '@/features/learn/text';
import { useLearnText } from '@/features/learn/useLearnText';
import { TopicCell } from './TopicCell';

type StartPointCardProps = {
  /** Null when the check found every topic known. */
  start: HiveTopic | null;
  /** Known topics of the start's unit ("4.1 və 4.2"). */
  knownBefore: HiveTopic[];
};

/** The inverted card with the cell to start from ("Başlanğıc nöqtən"). */
export function StartPointCard({ start, knownBefore }: StartPointCardProps) {
  const { t } = useLearnText();
  const known = listJoin(
    knownBefore.map((x) => x.number),
    t('learn.and'),
  );

  return (
    <View
      accessible
      accessibilityLabel={t('learn.result.startPoint')}
      className="flex-row items-center gap-3.5 rounded-xl bg-spot px-4 py-3.5"
    >
      {start ? (
        <TopicCell level={start.level} number={start.number} size={52} numberSize="sm" />
      ) : null}
      <View className="min-w-0 flex-1 gap-1">
        <Text variant="overline" className="text-xs text-honey">
          {t('learn.result.startOverline')}
        </Text>
        <Text className="font-sans-black text-base text-on-spot">
          {start
            ? t('learn.hive.hereTopic', { number: start.number, title: start.title })
            : t('learn.result.allKnown')}
        </Text>
        <Text className="text-sm text-on-spot opacity-85">
          {!start
            ? t('learn.result.allKnownBody')
            : knownBefore.length > 0
              ? t('learn.result.startBodyKnown', { known })
              : t('learn.result.startBody')}
        </Text>
      </View>
    </View>
  );
}
