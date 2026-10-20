import { useTranslation } from 'react-i18next';
import { ExamSetupForm } from '@/components/exam/ExamSetupForm';
import { ErrorState, LoadingState, Screen, ScreenHeader } from '@/components/ui';
import { useExamGoal } from '@/features/exam/queries';

/** Hədəf seçimi: the exam, its group, the target result and the daily time. */
export default function ExamSetupScreen() {
  const { t } = useTranslation();
  const query = useExamGoal();

  return (
    <Screen className="gap-3">
      <ScreenHeader title={t('exam.setup.title')} />
      {query.isPending ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState onRetry={() => void query.refetch()} />
      ) : (
        <ExamSetupForm current={query.data.goal} />
      )}
    </Screen>
  );
}
