import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { TestResultView } from '@/components/tests/TestResultView';
import { EmptyState, ErrorState, LoadingState, Screen } from '@/components/ui';
import { useTest } from '@/features/tests/queries';
import { useTestSessionStore } from '@/features/tests/sessionStore';

export default function TestResultScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useTest(id);
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
  if (!result) {
    return (
      <Screen>
        <EmptyState
          icon="stats-chart-outline"
          title={t('results.emptyTitle')}
          description={t('results.emptyDescription')}
        />
      </Screen>
    );
  }

  return <TestResultView test={query.data} result={result} />;
}
