import { router } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Icon, Text } from '@/components/ui';
import { Mascot } from '@/components/mascot/Mascot';
import { placementResult, placementWave } from '@/features/learn/hiveMotion';
import { findTopic } from '@/features/learn/mastery';
import type { Hive, PlacementOutcome } from '@/features/learn/types';
import { useLandedCount } from '@/features/learn/useLandedCount';
import { useLearnText } from '@/features/learn/useLearnText';
import { playCue } from '@/lib/cues';
import { useReducedMotionPref } from '@/motion';
import { Appear } from './Appear';
import { PlacementUnitRow } from './PlacementUnitRow';
import { StartPointCard } from './StartPointCard';

type PlacementResultViewProps = {
  hive: Hive;
  outcome: PlacementOutcome;
};

/**
 * What the check found: cells filled per unit, the start point, then start there. The known
 * cells fill in a diagonal wave, then Vızı pops in and the start cell pulses twice
 * (hive.placement-result C).
 */
export function PlacementResultView({ hive, outcome }: PlacementResultViewProps) {
  const { t } = useLearnText();
  const reduced = useReducedMotionPref();
  const count = outcome.knownTopicIds.length;
  const wave = useMemo(
    () => placementWave(hive.units, outcome.knownTopicIds, outcome.startTopicId),
    [hive.units, outcome.knownTopicIds, outcome.startTopicId],
  );
  const shown = useLandedCount(Object.values(wave.landAt).flat());
  const p = placementResult;
  const viziAt = wave.end - 100;
  const title = (n: number) =>
    count > 0 ? t('learn.result.title', { count: n }) : t('learn.result.titleNone');

  useEffect(() => {
    // The success tap comes with Vızı; at once when motion is reduced.
    const id = setTimeout(() => playCue('complete'), reduced ? 0 : viziAt);
    return () => clearTimeout(id);
    // Once, when the result opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
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
          <Appear
            from={{ opacity: 0, y: 10, scale: 0.6 }}
            delay={viziAt}
            duration={p.vizi}
            ease="pop"
          >
            <Mascot moment="correct" size={96} />
          </Appear>
          <View className="min-w-0 flex-1 gap-1">
            <Text
              variant="heading"
              accessibilityLabel={title(count)}
              className="font-display-black text-[26px] leading-[30px]"
            >
              {title(shown)}
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
              cellAt={wave.cellAt}
              landAt={wave.landAt[unit.id] ?? []}
            />
          ))}
        </View>
        <Appear from={{ opacity: 0, y: 12 }} delay={wave.end} duration={p.card}>
          <StartPointCard
            start={place?.topic ?? null}
            knownBefore={knownBefore}
            pulseAt={wave.end + p.card}
          />
        </Appear>
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
