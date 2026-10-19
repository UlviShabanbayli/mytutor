import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Icon, Text } from '@/components/ui';
import { Mascot } from '@/components/mascot/Mascot';
import { findTopic } from '@/features/learn/mastery';
import type { Hive, PlacementOutcome } from '@/features/learn/types';
import { useLearnText } from '@/features/learn/useLearnText';
import { PlacementUnitRow } from './PlacementUnitRow';
import { StartPointCard } from './StartPointCard';

type PlacementResultViewProps = {
  hive: Hive;
  outcome: PlacementOutcome;
};

/** What the check found: cells filled per unit, the start point, then start there. */
export function PlacementResultView({ hive, outcome }: PlacementResultViewProps) {
  const { t } = useLearnText();
  const count = outcome.knownTopicIds.length;
  const place = outcome.startTopicId ? findTopic(hive, outcome.startTopicId) : null;
  const knownBefore = place
    ? place.unit.topics.slice(0, place.index).filter((x) => outcome.knownTopicIds.includes(x.id))
    : [];
  const toHive = () => router.replace({ pathname: '/subject/[id]', params: { id: hive.id } });

  return (
    <SafeAreaView className="flex-1 bg-page">
      <ScrollView contentContainerClassName="flex-grow gap-3 px-4 pb-4 pt-2">
        <Text variant="overline" tone="muted" className="text-xs">
          {t('learn.result.overline')}
        </Text>
        <View className="flex-row items-center gap-2.5">
          <Mascot moment="correct" size={96} />
          <View className="min-w-0 flex-1 gap-1">
            <Text variant="heading" className="font-display-black text-[26px] leading-[30px]">
              {count > 0 ? t('learn.result.title', { count }) : t('learn.result.titleNone')}
            </Text>
            <Text className="text-sm" tone="muted">
              {t(count > 0 ? 'learn.result.score' : 'learn.result.scoreNone', outcome)}
            </Text>
          </View>
        </View>
        <View
          accessibilityLabel={t('learn.result.units')}
          className="rounded-xl border border-border bg-surf px-3.5 py-1.5"
        >
          {hive.units.map((unit, i) => (
            <PlacementUnitRow
              key={unit.id}
              unit={unit}
              knownIds={outcome.knownTopicIds}
              startId={outcome.startTopicId}
              divider={i > 0}
            />
          ))}
        </View>
        <StartPointCard start={place?.topic ?? null} knownBefore={knownBefore} />
        {count > 0 ? (
          <View className="flex-row items-start gap-2">
            <Icon name="drop" size={16} color="honey-text" />
            <Text variant="caption" tone="muted" className="flex-1 font-sans">
              {t('learn.result.honeyNote')}
            </Text>
          </View>
        ) : null}
        <View className="flex-1" />
        <Button
          label={t('learn.result.startHere')}
          onPress={() =>
            place
              ? router.replace({ pathname: '/topic/[id]', params: { id: place.topic.id } })
              : toHive()
          }
        />
        <Button variant="text" size="md" label={t('learn.result.seeHive')} onPress={toHive} />
      </ScrollView>
    </SafeAreaView>
  );
}
