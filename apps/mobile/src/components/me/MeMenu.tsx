import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { LeagueId } from '@/features/me/types';
import { MenuRow } from './MenuRow';

type MeMenuProps = {
  unread: number;
  progressValue: string;
  league: { id: LeagueId; place: number } | null;
  parentName: string | null;
  plan: 'free' | 'premium';
};

/** The account menu of the "Mən" tab: classes, progress, league, parent, privacy, plan, settings. */
export function MeMenu({ unread, progressValue, league, parentName, plan }: MeMenuProps) {
  const { t } = useTranslation();

  return (
    <View
      accessibilityLabel={t('me.home.menuLabel')}
      className="overflow-hidden rounded-[18px] border border-border bg-surf"
    >
      <MenuRow
        icon="users"
        label={t('me.home.classes')}
        badge={unread > 0 ? t('me.home.newCount', { count: unread }) : undefined}
        onPress={() => router.push('/me/classes')}
      />
      <MenuRow
        divider
        icon="chart"
        label={t('me.home.progress')}
        value={progressValue}
        onPress={() => router.push('/me/progress')}
      />
      <MenuRow
        divider
        icon="trophy"
        label={t('me.home.league')}
        value={
          league
            ? t('me.home.leagueValue', {
                league: t(`me.leagues.${league.id}`),
                place: t('me.shared.place', { count: league.place, ordinal: true }),
              })
            : t('me.home.leagueOff')
        }
        onPress={() => router.push('/me/league')}
      />
      <MenuRow
        divider
        icon="link"
        label={t('me.home.parent')}
        value={
          parentName ? t('me.home.parentValue', { name: parentName }) : t('me.home.parentNone')
        }
        onPress={() => router.push('/me/parent-link')}
      />
      <MenuRow
        divider
        icon="eye"
        label={t('me.home.privacy')}
        value={t('me.home.privacyValue')}
        onPress={() => router.push('/me/privacy')}
      />
      <MenuRow
        divider
        icon="star"
        label={t('me.home.subscription')}
        value={plan === 'premium' ? t('me.home.planPremium') : t('me.home.planFree')}
        onPress={() => router.push('/me/subscription')}
      />
      <MenuRow
        divider
        icon="settings"
        label={t('me.home.settings')}
        onPress={() => router.push('/me/settings')}
      />
    </View>
  );
}
