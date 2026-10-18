import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { TestResultView } from '@/components/tests/TestResultView';
import { EmptyState, ErrorState, LoadingState, Screen, ScreenHeader } from '@/components/ui';
import { useStudyTest } from '@/features/study/queries';
import { useTestSessionStore } from '@/features/tests/sessionStore';

export default function TestResultScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useStudyTest(id);
  const result = useTestSessionStore((s) => s.results.find((r) => r.testId === id));

  if (query.isPending)
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  if (query.isError)
    return (
      <Screen>
        <ErrorState onRetry={() => void query.refetch()} />
      </Screen>
    );
  if (!result || !query.data) {
    return (
      <Screen>
        <ScreenHeader title={t('result.title')} />
        <EmptyState title={t('results.emptyTitle')} description={t('results.emptyDescription')} />
      </Screen>
    );
  }

  return <TestResultView study={query.data} result={result} />;
}
