import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ExamLockedView } from '@/components/exam/ExamLockedView';
import { PlanView } from '@/components/exam/PlanView';
import {
  EmptyState,
  ErrorState,
  IconButton,
  LoadingState,
  Screen,
  ScreenHeader,
} from '@/components/ui';
import { daysLabel } from '@/features/exam/labels';
import { useExamGoal } from '@/features/exam/queries';
import { useExamState } from '@/features/exam/useExamState';

/** Hazırlıq planı: the full plan, or the premium lock on the free plan. */
export default function ExamPlanScreen() {
  const { t } = useTranslation();
  const query = useExamGoal();
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
      {query.isPending ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState onRetry={() => void query.refetch()} />
      ) : query.data.goal === null ? (
        <EmptyState
          moment="weakSpot"
          title={t('exam.empty.title')}
          description={t('exam.empty.body')}
          actionLabel={t('exam.empty.cta')}
          onAction={() => router.push('/exam/setup')}
        />
      ) : locked ? (
        <ExamLockedView days={daysLabel(t, query.data.daysLeft)} />
      ) : (
        <PlanView daysLeft={query.data.daysLeft} />
      )}
    </Screen>
  );
}
