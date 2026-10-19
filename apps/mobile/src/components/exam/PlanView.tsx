import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { EmptyState, ErrorState, Icon, LoadingState, Text } from '@/components/ui';
import { DEMO_DAYS_LEFT } from '@/features/exam/demo';
import { examDaysLeft, type ExamGoal } from '@/features/exam/goal';
import { dayMonth, daysLabel, minutesLabel, stepsLabel, weekdayName } from '@/features/exam/labels';
import { usePlan } from '@/features/exam/queries';
import { useExamStore } from '@/features/exam/store';
import { StepRow } from './StepRow';
import { WeekStrip } from './WeekStrip';

type PlanViewProps = {
  goal: ExamGoal;
};

/** The preparation plan: the week, what moved, today's steps with reasons, the next mock. */
export function PlanView({ goal }: PlanViewProps) {
  const { t } = useTranslation();
  const query = usePlan();
  const minutesPerDay = useExamStore((s) => s.minutesPerDay);
  const chains = useExamStore((s) => s.chainsInPlan.length);

  if (query.isPending) return <LoadingState />;
  if (query.isError) return <ErrorState onRetry={() => void query.refetch()} />;

  const { plan, nextMock } = query.data;
  const today = new Date();
  const total = plan.today.reduce((sum, s) => sum + s.minutes, 0);

  return (
    <View className="gap-3">
      <View className="flex-row flex-wrap items-center justify-between gap-2">
        <Text tone="muted" className="font-sans-bold text-sm">
          {t('exam.plan.meta', {
            days: daysLabel(t, examDaysLeft(goal, today, DEMO_DAYS_LEFT)),
            minutes: minutesLabel(t, minutesPerDay),
          })}
        </Text>
        <View className="flex-row items-center gap-1">
          <Icon name="refresh" size={14} color="muted" />
          <Text tone="muted" className="text-sm">
            {t('exam.plan.updated', { time: plan.updatedAt })}
          </Text>
        </View>
      </View>

      <WeekStrip days={plan.days} today={today} />

      {plan.moved ? (
        <View
          accessibilityRole="summary"
          className="flex-row items-center gap-2.5 rounded-lg bg-raised px-3 py-2.5"
        >
          <Icon name="refresh" size={22} color="honey-text" />
          <Text className="min-w-0 flex-1 text-sm">
            <Text className="font-sans-black text-sm">
              {t('exam.plan.movedTitle', { steps: stepsLabel(t, plan.moved) })}
            </Text>
            {t('exam.plan.movedBody')}
          </Text>
        </View>
      ) : null}
      {chains > 0 ? (
        <View className="flex-row items-center gap-2 rounded-lg bg-ok-bg px-3 py-2">
          <Icon name="link" size={18} color="ok" />
          <Text className="min-w-0 flex-1 text-sm">
            {t('exam.plan.chainsAdded', { count: chains })}
          </Text>
        </View>
      ) : null}

      <View accessibilityLabel={t('exam.plan.stepsA11y')} className="gap-2">
        <View className="flex-row items-baseline justify-between gap-2">
          <Text variant="heading" className="text-md">
            {t('exam.plan.todayTitle', { date: dayMonth(t, today) })}
          </Text>
          <Text tone="muted" className="font-sans-bold text-xs">
            {t('exam.plan.todayMeta', {
              steps: stepsLabel(t, plan.today.length),
              minutes: minutesLabel(t, total),
            })}
          </Text>
        </View>
        {plan.today.length === 0 ? (
          <EmptyState
            moment="focus"
            title={t('exam.plan.emptyTitle')}
            description={t('exam.plan.emptyBody')}
          />
        ) : (
          plan.today.map((step) => <StepRow key={step.id} step={step} showReason />)
        )}
      </View>

      <View className="flex-row items-center gap-2.5 rounded-lg border border-dashed border-border px-3 py-2.5">
        <Icon name="exam" size={20} color="muted" />
        <Text tone="muted" className="min-w-0 flex-1 text-sm">
          {t('exam.plan.mockNote', {
            weekday: weekdayName(t, nextMock.startsAt),
            number: nextMock.number,
          })}
        </Text>
      </View>
    </View>
  );
}
