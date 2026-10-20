import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { TestSession } from '@/components/tests/TestSession';
import {
  DepthScreen,
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
  ScreenHeader,
} from '@/components/ui';
import { testKindLabel } from '@/features/study/labels';
import { MISTAKES_TEST_ID } from '@/features/study/mistakes';
import { useStudyTest } from '@/features/study/queries';

export default function TestScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useStudyTest(id);

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
  if (!query.data) {
    // An empty mistakes run, or a topic whose test the demo does not have yet.
    const run = id === MISTAKES_TEST_ID;
    return (
      <Screen>
        <ScreenHeader title={run ? t('study.mistakes.title') : ''} />
        <EmptyState
          moment={run ? 'correct' : 'aiThinking'}
          title={run ? t('study.test.emptyTitle') : t('study.test.missingTitle')}
          description={run ? t('study.test.emptyBody') : t('study.test.missingBody')}
          actionLabel={t('study.common.continue')}
          onAction={() => router.replace('/learn')}
        />
      </Screen>
    );
  }

  // The exit dialog makes the running test step back behind it (transitions.dialog C).
  return (
    <DepthScreen>
      <TestSession study={query.data} kind={testKindLabel(t, query.data)} />
    </DepthScreen>
  );
}
