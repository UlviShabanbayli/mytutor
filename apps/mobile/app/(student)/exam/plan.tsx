import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ExamLockedView } from '@/components/exam/ExamLockedView';
import { PlanView } from '@/components/exam/PlanView';
import { EmptyState, IconButton, Screen, ScreenHeader } from '@/components/ui';
import { useAppStore } from '@/features/app/appStore';
import { DEMO_DAYS_LEFT } from '@/features/exam/demo';
import { examDaysLeft, examGoalOf } from '@/features/exam/goal';
import { daysLabel } from '@/features/exam/labels';
import { useExamState } from '@/features/exam/useExamState';

/** Hazırlıq planı: the full plan, or the premium lock on the free plan. */
export default function ExamPlanScreen() {
  const { t } = useTranslation();
  const goal = examGoalOf(useAppStore((s) => s.profile.goal));
  const { locked } = useExamState();

  return (
    <Screen className="gap-3">
      <ScreenHeader
        title={t('exam.plan.title')}
        actions={
          <IconButton
            icon="calendar"
            accessibilityLabel={t('exam.tab.deadlines')}
            onPress={() => router.push('/exam/deadlines')}
          />
        }
      />
      {goal === null ? (
        <EmptyState
          moment="weakSpot"
          title={t('exam.empty.title')}
          description={t('exam.empty.body')}
          actionLabel={t('exam.empty.cta')}
          onAction={() => router.push('/exam/setup')}
        />
      ) : locked ? (
        <ExamLockedView days={daysLabel(t, examDaysLeft(goal, new Date(), DEMO_DAYS_LEFT))} />
      ) : (
        <PlanView goal={goal} />
      )}
    </Screen>
  );
}
