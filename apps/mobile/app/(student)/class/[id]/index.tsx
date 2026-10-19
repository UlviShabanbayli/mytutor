import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ClassPage } from '@/components/me/ClassPage';
import { EmptyState, ErrorState, LoadingState, Screen, ScreenHeader } from '@/components/ui';
import { useClass } from '@/features/me/queries';
import { useMeStore } from '@/features/me/store';

/** A class the student is in (architecture Ş10); anyone else is pointed to joining by code. */
export default function ClassScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const guest = useMeStore((s) => s.guest);
  const query = useClass(id);

  if (guest) return <Redirect href={{ pathname: '/auth/account', params: { reason: 'class' } }} />;
  if (query.isPending || query.isError || query.data === null) {
    return (
      <Screen>
        <ScreenHeader title={t('me.classes.title')} />
        {query.isPending ? (
          <LoadingState />
        ) : query.isError ? (
          <ErrorState onRetry={() => void query.refetch()} />
        ) : (
          <EmptyState
            title={t('me.classPage.notMemberTitle')}
            description={t('me.classPage.notMemberBody')}
            actionLabel={t('me.classPage.notMemberAction')}
            onAction={() => router.replace('/me/join')}
          />
        )}
      </Screen>
    );
  }

  return <ClassPage summary={query.data.summary} feed={query.data.feed} />;
}
