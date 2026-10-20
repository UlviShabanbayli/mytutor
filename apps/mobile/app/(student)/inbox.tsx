import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { InboxList } from '@/components/today/InboxList';
import { ReadAllButton } from '@/components/today/ReadAllButton';
import {
  Banner,
  Button,
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
  ScreenHeader,
} from '@/components/ui';
import { useOnline } from '@/features/today/hooks';
import { useInbox } from '@/features/today/queries';

/** "Gələnlər": every notification also lands here and opens its exact screen (P1). */
export default function StudentInboxScreen() {
  const { t } = useTranslation();
  const inbox = useInbox();
  const online = useOnline();

  return (
    // Pulling down checks for news once there is a list (transitions.refresh B).
    <Screen className="gap-2" onRefresh={inbox.data?.length ? () => inbox.refetch() : undefined}>
      <ScreenHeader
        title={t('today.inbox.title')}
        actions={<ReadAllButton items={inbox.data ?? []} />}
      />
      {!online ? <Banner kind="offline" message={t('today.inbox.offline')} /> : null}
      {inbox.isPending ? (
        <LoadingState />
      ) : inbox.isError ? (
        <ErrorState onRetry={() => void inbox.refetch()} />
      ) : inbox.data.length === 0 ? (
        <EmptyState title={t('today.inbox.emptyTitle')} description={t('today.inbox.emptyBody')} />
      ) : (
        <InboxList items={inbox.data} />
      )}
      <Button
        label={t('today.inbox.settings')}
        icon="settings"
        variant="secondary"
        size="md"
        onPress={() => router.push('/me/settings')}
        className="mt-2"
      />
    </Screen>
  );
}
