import { useTranslation } from 'react-i18next';
import { BadgeGrid } from '@/components/me/BadgeGrid';
import { ErrorState, LoadingState, Screen, ScreenHeader } from '@/components/ui';
import { useMeOverview } from '@/features/me/queries';

/** All badges ("Nişanlar → Hamısı"): the earned ones and how many are still locked. */
export default function BadgesScreen() {
  const { t } = useTranslation();
  const overview = useMeOverview();

  return (
    <Screen>
      <ScreenHeader title={t('me.badgesPage.title')} />
      {overview.isPending ? (
        <LoadingState />
      ) : overview.isError ? (
        <ErrorState onRetry={() => void overview.refetch()} />
      ) : (
        <BadgeGrid
          badges={overview.data.badges}
          locked={overview.data.badgesTotal - overview.data.badges.length}
        />
      )}
    </Screen>
  );
}
