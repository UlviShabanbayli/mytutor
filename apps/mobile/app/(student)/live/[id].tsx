import { Redirect, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { LiveLesson } from '@/components/me/LiveLesson';
import { EmptyState, ErrorState, LoadingState, Screen, ScreenHeader } from '@/components/ui';
import { useLiveSession } from '@/features/me/queries';
import { useMeStore } from '@/features/me/store';

/** A live lesson of the student's class (architecture M5, student side). */
export default function LiveScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const guest = useMeStore((s) => s.guest);
  const query = useLiveSession(id);

  if (guest) return <Redirect href={{ pathname: '/auth/account', params: { reason: 'class' } }} />;
  if (query.isPending || query.isError || query.data === null) {
    return (
      <Screen>
        <ScreenHeader title={t('me.classPage.liveOverline')} />
        {query.isPending ? (
          <LoadingState />
        ) : query.isError ? (
          <ErrorState onRetry={() => void query.refetch()} />
        ) : (
          <EmptyState title={t('me.live.notFoundTitle')} description={t('me.live.notFoundBody')} />
        )}
      </Screen>
    );
  }

  return <LiveLesson session={query.data} />;
}
