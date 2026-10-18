import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { minutesLabel } from '@/features/exam/labels';
import type { PlanStep } from '@/features/exam/types';
import { SectionLink } from './SectionLink';
import { StepRow } from './StepRow';

type TodayPlanSectionProps = {
  steps: PlanStep[];
  offline: boolean;
};

const HOME_STEPS = 3;

/** "Bu günün planı" on the exam tab: the first steps and minutes done; the link opens the plan. */
export function TodayPlanSection({ steps, offline }: TodayPlanSectionProps) {
  const { t } = useTranslation();
  const total = steps.reduce((sum, s) => sum + s.minutes, 0);
  const done = steps.filter((s) => s.state === 'done').reduce((sum, s) => sum + s.minutes, 0);

  return (
    <View accessibilityLabel={t('exam.home.planTitle')} className="gap-1.5">
      <View className="flex-row items-center justify-between gap-2">
        <Text variant="heading" className="text-md">
          {t('exam.home.planTitle')}
        </Text>
        <SectionLink
          label={t('exam.home.planMeta', { done, total: minutesLabel(t, total) })}
          accessibilityLabel={t('exam.home.planA11y', { done, total })}
          onPress={() => router.push('/exam/plan')}
        />
      </View>
      {steps.slice(0, HOME_STEPS).map((step) => (
        <StepRow key={step.id} step={step} offline={offline} />
      ))}
    </View>
  );
}
