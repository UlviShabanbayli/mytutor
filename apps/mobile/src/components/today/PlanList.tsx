import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { planSummary } from '@/features/today/plan';
import type { PlanStep } from '@/features/today/types';
import { PlanStepRow } from './PlanStepRow';

type PlanListProps = {
  steps: PlanStep[];
};

/** "Günün planı": 2–4 steps with their total length. Hidden when the plan is empty. */
export function PlanList({ steps }: PlanListProps) {
  const { t } = useTranslation();
  if (steps.length === 0) return null;
  const summary = planSummary(steps);

  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between gap-2">
        <Text variant="heading">{t('today.plan.title')}</Text>
        <Text className="font-sans-bold text-xs text-muted">
          {summary.minutes !== null
            ? t('today.plan.summary', { count: summary.count, minutes: summary.minutes })
            : t('today.plan.steps', { count: summary.count })}
        </Text>
      </View>
      {steps.map((step) => (
        <PlanStepRow key={step.id} step={step} />
      ))}
    </View>
  );
}
