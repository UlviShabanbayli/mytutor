import { View } from 'react-native';
import { Banner, Button, Icon, IconButton, Sheet, SourceLine, Text } from '@/components/ui';
import { nextStep, type TopicPlace } from '@/features/learn/mastery';
import { openKnowSkip, openStep } from '@/features/learn/navigation';
import { useRealTest } from '@/features/learn/queries';
import type { Hive } from '@/features/learn/types';
import { useLearnText } from '@/features/learn/useLearnText';
import { LevelPill } from './LevelPill';
import { StepBars } from './StepBars';
import { TopicCell } from './TopicCell';

type CellSheetProps = {
  hive: Hive;
  place: TopicPlace;
  online: boolean;
  onClose: () => void;
};

/** The sheet a tapped cell opens: level, steps, source, and where to go next. */
export function CellSheet({ hive, place, online, onClose }: CellSheetProps) {
  const { t, source, levelCaps, levelAria } = useLearnText();
  const { test } = useRealTest(hive, place.globalIndex);
  const { unit, topic, index } = place;
  const step = nextStep(topic);
  const blocked = !online && !hive.savedTopicIds.includes(topic.id);
  const go = (action: () => void) => {
    onClose();
    action();
  };

  return (
    <Sheet visible onClose={onClose} title={`${topic.number} ${topic.title}`} showTitle={false}>
      <View className="flex-row items-start gap-3.5">
        <TopicCell
          level={topic.level}
          number={topic.number}
          word={levelCaps(topic.level)}
          size={66}
        />
        <View
          accessible
          accessibilityLabel={`${topic.number} ${topic.title}: ${levelAria(topic.level)}`}
          className="min-w-0 flex-1 gap-1.5"
        >
          <Text variant="overline" tone="muted">
            {t('learn.sheet.overline', {
              unit: unit.number,
              index: index + 1,
              total: unit.topics.length,
            })}
          </Text>
          <Text variant="subheading">{topic.title}</Text>
          <LevelPill level={topic.level} />
        </View>
        <IconButton
          icon="close"
          color="muted"
          accessibilityLabel={t('common.close')}
          onPress={onClose}
        />
      </View>
      <StepBars topic={topic} />
      <SourceLine source={source(hive, topic)} />
      {topic.material ? (
        <View className="flex-row items-center gap-2.5 rounded-md bg-raised px-3 py-2">
          <Icon name="video" size={18} color="honey-text" />
          <Text className="flex-1 font-sans-semibold text-sm">
            {t('learn.sheet.material', {
              teacher: topic.material.teacherShort,
              className: topic.material.className,
            })}
          </Text>
        </View>
      ) : null}
      {blocked ? <Banner kind="offline" message={t('learn.sheet.offline')} /> : null}
      <Button
        label={t('learn.sheet.continue', { step: t(`learn.step.caps.${step}`) })}
        disabled={blocked || (step === 'test' && !test)}
        onPress={() => go(() => openStep(topic, step, test?.id ?? null))}
      />
      <View className="flex-row gap-2">
        <Button
          variant="secondary"
          size="md"
          icon="star"
          label={t('learn.topic.toTest')}
          disabled={blocked || !test}
          onPress={() => go(() => openStep(topic, 'test', test?.id ?? null))}
          className="flex-1"
        />
        <Button
          variant="secondary"
          size="md"
          label={t('learn.sheet.knowSkip')}
          disabled={blocked}
          onPress={() => go(() => openKnowSkip(topic.id))}
          className="flex-1"
        />
      </View>
    </Sheet>
  );
}
