import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ClassChat } from '@/components/me/ClassChat';
import { EmptyState, ErrorState, LoadingState, Screen, ScreenHeader } from '@/components/ui';
import { useClass, useMeOverview } from '@/features/me/queries';
import { useMeStore } from '@/features/me/store';

/** The class chat of a class the student is in (architecture Ş10, P6). */
export default function ClassChatScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const guest = useMeStore((s) => s.guest);
  const query = useClass(id);
  const me = useMeOverview();

  if (guest) return <Redirect href={{ pathname: '/auth/account', params: { reason: 'class' } }} />;
  if (query.isPending || query.isError || query.data === null) {
    return (
      <Screen>
        <ScreenHeader title={t('me.classPage.tabChat')} />
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

  return <ClassChat summary={query.data.summary} studentName={me.data?.name ?? ''} />;
}
