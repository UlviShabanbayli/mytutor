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
  if (!query.data)
    return (
      <Screen>
        <ScreenHeader title={t('study.mistakes.title')} />
        <EmptyState
          moment="correct"
          title={t('study.test.emptyTitle')}
          description={t('study.test.emptyBody')}
          actionLabel={t('study.common.continue')}
          onAction={() => router.replace('/learn')}
        />
      </Screen>
    );

  // The exit dialog makes the running test step back behind it (transitions.dialog C).
  return (
    <DepthScreen>
      <TestSession study={query.data} kind={testKindLabel(t, query.data)} />
    </DepthScreen>
  );
}
