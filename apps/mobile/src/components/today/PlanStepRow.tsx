import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { HexCell, Icon, PressableCard, StaggerLead, StaggerText, Text } from '@/components/ui';
import { stepHref } from '@/features/today/plan';
import type { PlanStep, StepReason } from '@/features/today/types';
import { HexShape } from './HexShape';

type PlanStepRowProps = {
  step: PlanStep;
};

function useReason(reason: StepReason): string {
  const { t } = useTranslation();
  switch (reason.kind) {
    case 'crystallized':
      return t('today.plan.reason.crystallized', { count: reason.daysAgo });
    case 'unfinished':
      return t('today.plan.reason.unfinished', { count: reason.stepsLeft });
    case 'mistakes':
      return t('today.plan.reason.mistakes', { count: reason.count });
    case 'questions':
      return t('today.plan.reason.questions', { count: reason.count });
    case 'assignment':
      return t('today.plan.reason.assignment', { className: reason.className });
    case 'examPlan':
      return t('today.plan.reason.examPlan');
  }
}

/** One step of the day's plan: the topic cell, what and why, length and honey points. */
export function PlanStepRow({ step }: PlanStepRowProps) {
  const { t } = useTranslation();
  const title = t(`today.plan.kind.${step.kind}`, { title: step.title });
  const reason = useReason(step.reason);
  const length =
    step.minutes !== null
      ? t('today.plan.minutes', { count: step.minutes })
      : t('today.plan.questions', { count: step.questionCount ?? 0 });

  return (
    <PressableCard
      accessibilityLabel={[
        title,
        reason,
        length,
        t('today.plan.pointsLabel', { count: step.points }),
      ].join('. ')}
      onPress={() => router.push(stepHref(step.kind, step.targetId))}
      className="rounded-lg"
      contentClassName="min-h-[66px] flex-row items-center gap-3 rounded-lg px-3 py-2"
    >
      <StaggerLead>
        {step.code ? (
          <HexCell state={step.cell} size={44} label={step.code} />
        ) : (
          <HexShape width={44} height={50} fill="raised">
            <Icon name="target" size={20} color="honey-text" />
          </HexShape>
        )}
      </StaggerLead>
      <StaggerText className="gap-0.5">
        <Text className="font-sans-black" numberOfLines={2}>
          {title}
        </Text>
        <Text tone="muted" className="text-xs" numberOfLines={2}>
          {reason}
        </Text>
      </StaggerText>
      <View className="shrink-0 items-end gap-0.5">
        <Text className="font-sans-bold text-xs text-muted">{length}</Text>
        <Text className="font-sans-black text-sm text-honey-text">
          {t('today.plan.points', { count: step.points })}
        </Text>
      </View>
    </PressableCard>
  );
}
