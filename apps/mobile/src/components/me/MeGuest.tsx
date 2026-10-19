import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { StatTile } from '@/components/progress/StatTile';
import { ErrorState, LoadingState, Screen } from '@/components/ui';
import { useAppStore } from '@/features/app/appStore';
import { useGuestOverview } from '@/features/me/queries';
import { streakDays } from '@/features/tests/progress';
import { useTestSessionStore } from '@/features/tests/sessionStore';
import { GuestAccountCard } from './GuestAccountCard';
import { InfoNote } from './InfoNote';
import { MeHeader } from './MeHeader';
import { MenuRow } from './MenuRow';

/** The "Mən" tab before an account exists: progress on this phone and why an account helps. */
export function MeGuest() {
  const { t } = useTranslation();
  const overview = useGuestOverview();
  const results = useTestSessionStore((s) => s.results);
  const grade = useAppStore((s) => s.profile.grade);

  if (overview.isPending) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }
  if (overview.isError) {
    return (
      <Screen>
        <ErrorState onRetry={() => void overview.refetch()} />
      </Screen>
    );
  }

  const account = (reason: string) =>
    router.push({ pathname: '/auth/account', params: { reason } });

  return (
    <Screen className="gap-2.5">
      <MeHeader
        name={null}
        subtitle={
          grade === null
            ? t('me.guest.deviceOnly')
            : t('me.guest.device', { grade: t('common.grade', { count: grade, ordinal: true }) })
        }
      />
      <View accessibilityLabel={t('me.home.statsLabel')} className="flex-row gap-2">
        <StatTile icon="wing" value={String(streakDays(results))} label={t('me.home.streak')} />
        <StatTile icon="drop" value={String(overview.data.points)} label={t('me.guest.points')} />
        <StatTile
          icon="learn"
          value={String(overview.data.honeyCells)}
          label={t('me.home.honeyCells')}
        />
      </View>
      <InfoNote icon="phone" lead={t('me.guest.noticeLead')} status>
        {t('me.guest.noticeBody')}
      </InfoNote>
      <GuestAccountCard />
      <View
        accessibilityLabel={t('me.home.menuLabel')}
        className="overflow-hidden rounded-[18px] border border-border bg-surf"
      >
        <MenuRow
          icon="chart"
          label={t('me.home.progress')}
          onPress={() => router.push('/me/progress')}
        />
        <MenuRow
          divider
          icon="users"
          label={t('me.home.classes')}
          lockedNote={t('me.guest.locked')}
          accessibilityHint={t('me.guest.lockedHint')}
          onPress={() => account('classes')}
        />
        <MenuRow
          divider
          icon="trophy"
          label={t('me.home.league')}
          lockedNote={t('me.guest.locked')}
          accessibilityHint={t('me.guest.lockedHint')}
          onPress={() => account('league')}
        />
      </View>
    </Screen>
  );
}
