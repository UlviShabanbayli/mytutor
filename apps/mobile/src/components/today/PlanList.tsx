import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { StaggerGroup, StaggerItem, Text } from '@/components/ui';
import { planSummary } from '@/features/today/plan';
import type { PlanStep } from '@/features/today/types';
import { PlanStepRow } from './PlanStepRow';

type PlanListProps = {
  steps: PlanStep[];
};

/**
 * "Günün planı": 2–4 steps with their total length. Hidden when the plan is empty. The steps
 * come in one after another when the plan first shows (transitions.list C).
 */
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
      <StaggerGroup>
        {steps.map((step, i) => (
          <StaggerItem key={step.id} index={i}>
            <PlanStepRow step={step} />
          </StaggerItem>
        ))}
      </StaggerGroup>
    </View>
  );
}
