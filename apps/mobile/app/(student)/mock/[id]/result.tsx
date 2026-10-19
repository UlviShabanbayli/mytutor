import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MockNotFound } from '@/components/exam/MockNotFound';
import { MockResultView } from '@/components/exam/MockResultView';
import { EmptyState, ErrorState, LoadingState, Screen, ScreenHeader } from '@/components/ui';
import { useMockRunHydrated, useMockRunStore } from '@/features/exam/mockRunStore';
import { useMock } from '@/features/exam/queries';

/** Sınaq nəticəsi: the latest finished attempt of this mock. */
export default function MockResultScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const hydrated = useMockRunHydrated();
  const query = useMock(id);
  const attempt = useMockRunStore((s) => s.attempts[id]);

  if (query.data === null) return <MockNotFound />;
  if (!hydrated || query.isPending || query.isError)
    return (
      <Screen>
        {query.isError ? <ErrorState onRetry={() => void query.refetch()} /> : <LoadingState />}
      </Screen>
    );
  if (attempt?.finishedAt == null)
    return (
      <Screen>
        <ScreenHeader title={t('exam.result.title')} />
        <EmptyState
          moment="aiThinking"
          title={t('exam.result.noneTitle')}
          description={t('exam.result.noneBody')}
          actionLabel={t('exam.notFound.cta')}
          onAction={() => router.replace('/exam/mocks')}
        />
      </Screen>
    );

  return (
    <MockResultView mock={query.data} attempt={{ ...attempt, finishedAt: attempt.finishedAt }} />
  );
}
