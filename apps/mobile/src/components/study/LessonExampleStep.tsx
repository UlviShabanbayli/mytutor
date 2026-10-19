import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Banner, Button, SourceLine, Text } from '@/components/ui';
import { useIsOnline } from '@/features/study/online';
import type { StudyLesson } from '@/features/study/types';
import { Kicker } from './Kicker';
import { StepLayout } from './StepLayout';
import { WorkedStepItem } from './WorkedStepItem';

type LessonExampleStepProps = {
  lesson: StudyLesson;
  onNext: () => void;
};

/** Step 3: a solved example; each step opens on request, so the student thinks first. */
export function LessonExampleStep({ lesson, onNext }: LessonExampleStepProps) {
  const { t } = useTranslation();
  const online = useIsOnline();
  const { example } = lesson;
  const [shown, setShown] = useState(1);
  const hidden = example.steps[shown];

  return (
    <StepLayout
      footer={
        hidden ? (
          <Button
            label={t('study.lesson.showNextStep')}
            icon="eye"
            onPress={() => setShown(shown + 1)}
          />
        ) : (
          <Button label={t('study.common.continue')} onPress={onNext} />
        )
      }
    >
      {online ? null : (
        <Banner
          kind="offline"
          message={`${t('study.lesson.offlineTitle')} ${t('study.lesson.offlineBody')}`}
        />
      )}
      <Kicker>{t('study.lesson.exampleKicker', { n: example.number })}</Kicker>
      <View className="gap-1.5 rounded-xl border border-border bg-surf p-3.5">
        <Text variant="label" tone="muted">
          {t('study.lesson.problem')}
        </Text>
        <Text className="font-sans-bold text-lg">{example.problem}</Text>
      </View>
      <View accessibilityLabel={t('study.lesson.solutionSteps')} className="gap-2.5">
        {example.steps.slice(0, shown).map((step, i) => (
          <WorkedStepItem key={step.title} number={i + 1} step={step} />
        ))}
        {hidden ? <WorkedStepItem number={shown + 1} step={hidden} hidden /> : null}
      </View>
      {hidden ? (
        <Text variant="caption" tone="muted">
          {example.hint}
        </Text>
      ) : null}
      <SourceLine source={example.source} />
    </StepLayout>
  );
}
