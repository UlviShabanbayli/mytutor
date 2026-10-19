import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Banner, Button, IconButton, SourceLine, Text } from '@/components/ui';
import { cellMotionKind, cellTimeline } from '@/components/ui/hex/levelChange';
import { LevelSwap } from '@/components/ui/hex/LevelSwap';
import { findTopic, nextStep, type TopicPlace } from '@/features/learn/mastery';
import { backOr, openKnowSkip, openStep } from '@/features/learn/navigation';
import { useRealTest } from '@/features/learn/queries';
import { useLevelChange } from '@/features/learn/seenLevels';
import { useLearnStore } from '@/features/learn/store';
import type { Hive } from '@/features/learn/types';
import { useLearnText } from '@/features/learn/useLearnText';
import { useStepBody } from '@/features/learn/useStepBody';
import { useReducedMotionPref } from '@/motion';
import { CenterHeader } from './CenterHeader';
import { LevelPill } from './LevelPill';
import { MaterialCard } from './MaterialCard';
import { PrereqChips } from './PrereqChips';
import { StepRow } from './StepRow';
import { TopicCell } from './TopicCell';

type TopicViewProps = {
  hive: Hive;
  place: TopicPlace;
  online: boolean;
};

/** A topic: its cell and level, the four steps (advice, not a must), material, prerequisites. */
export function TopicView({ hive, place, online }: TopicViewProps) {
  const { t, source, levelCaps } = useLearnText();
  const stepBody = useStepBody();
  const saveTopics = useLearnStore((s) => s.saveTopics);
  const real = useRealTest(hive, place.globalIndex);
  const { unit, topic, index } = place;
  const saved = hive.savedTopicIds.includes(topic.id);
  const blocked = !online && !saved;
  const testId = real.test?.id ?? null;
  const prereqs = topic.prerequisites.flatMap((id) => findTopic(hive, id)?.topic ?? []);
  const toHive = () => router.replace({ pathname: '/subject/[id]', params: { id: hive.id } });
  // A level that moved since the student last saw it plays once (hive.fill-nectar and others).
  const reduced = useReducedMotionPref();
  const from = useLevelChange(topic.id, topic.level);
  const kind = from && !reduced ? cellMotionKind(from, topic.level) : null;

  return (
    <SafeAreaView className="flex-1 bg-page">
      <CenterHeader
        overline
        title={t('learn.sheet.overline', {
          unit: unit.number,
          index: index + 1,
          total: unit.topics.length,
        })}
        backLabel={t('learn.topic.back')}
        onBack={() => backOr(toHive)}
        action={
          <IconButton
            icon={saved ? 'check' : 'download'}
            accessibilityLabel={t(saved ? 'learn.topic.downloaded' : 'learn.topic.download')}
            onPress={() => saveTopics(hive.id, [topic.id])}
          />
        }
      />
      <ScrollView contentContainerClassName="gap-3.5 px-4 pb-4 pt-1">
        <View className="flex-row items-center gap-3.5">
          <TopicCell
            level={topic.level}
            number={topic.number}
            word={levelCaps(topic.level)}
            size={92}
            numberSize="lg"
            animateFrom={from}
            fromWord={from ? levelCaps(from) : undefined}
          />
          <View className="min-w-0 flex-1 items-start gap-2">
            <Text variant="heading" className="text-[18px] leading-[24px]">
              {topic.title}
            </Text>
            {kind && from ? (
              <LevelSwap
                align="start"
                at={cellTimeline[kind].swap}
                before={<LevelPill level={from} />}
                after={<LevelPill level={topic.level} />}
              />
            ) : (
              <LevelPill level={topic.level} />
            )}
          </View>
        </View>
        <SourceLine source={source(hive, topic)} />
        {blocked ? <Banner kind="offline" message={t('learn.topic.offline')} /> : null}
        <View className="gap-1.5">
          <View className="flex-row items-baseline justify-between gap-2">
            <Text variant="heading" className="text-[17px]">
              {t('learn.topic.stepsTitle')}
            </Text>
            <Text className="font-sans-bold text-xs" tone="muted">
              {t('learn.topic.stepsHint')}
            </Text>
          </View>
          {topic.steps.map((step, i) => (
            <StepRow
              key={step.kind}
              step={step}
              n={i + 1}
              body={stepBody(step, real)}
              disabled={blocked || (step.kind === 'test' && !testId)}
              onPress={() => openStep(topic, step.kind, testId)}
            />
          ))}
          <Button
            variant="text"
            size="md"
            label={t('learn.topic.knowSkip')}
            disabled={blocked}
            onPress={() => openKnowSkip(topic.id)}
          />
        </View>
        {topic.material ? (
          <MaterialCard
            material={topic.material}
            onOpen={() => openStep(topic, 'lesson', testId)}
          />
        ) : null}
        <PrereqChips topics={prereqs} />
      </ScrollView>
      <View className="flex-row gap-2.5 border-t border-border bg-surf px-4 pb-4 pt-3">
        <Button
          label={t('learn.topic.continue')}
          disabled={blocked || (nextStep(topic) === 'test' && !testId)}
          onPress={() => openStep(topic, nextStep(topic), testId)}
          className="flex-1"
        />
        <Button
          variant="secondary"
          icon="star"
          label={t('learn.topic.toTest')}
          disabled={blocked || !testId}
          onPress={() => openStep(topic, 'test', testId)}
          className="flex-1"
        />
      </View>
    </SafeAreaView>
  );
}
