import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Banner,
  ErrorState,
  Icon,
  IconButton,
  LoadingState,
  Screen,
  ScreenHeader,
  Text,
} from '@/components/ui';
import { useClasses, useIsOnline, useLeague } from '@/features/me/queries';
import { useMeStore } from '@/features/me/store';
import { ConfirmSheet } from './ConfirmSheet';
import { InfoSheet } from './InfoSheet';
import { LeagueHeroCard } from './LeagueHeroCard';
import { LeagueStandings } from './LeagueStandings';
import { PillTabs } from './PillTabs';

const pad = (n: number) => String(n).padStart(2, '0');

/** The weekly league of a student who joined: hero card, class or country table, leave. */
export function LeagueBoard() {
  const { t } = useTranslation();
  const [scope, setScope] = useState<'country' | 'class'>('country');
  const [sheet, setSheet] = useState<'rules' | 'leave' | null>(null);
  const league = useLeague(scope);
  const country = useLeague('country');
  const online = useIsOnline();
  const leave = useMeStore((s) => s.setLeagueJoined);
  // The class table exists only while the student is in a class.
  const myClass = useClasses().data?.[0];
  const updated = new Date(league.dataUpdatedAt);

  return (
    <Screen className="gap-2.5">
      <ScreenHeader
        title={t('me.league.title')}
        actions={
          <IconButton
            icon="info"
            color="muted"
            accessibilityLabel={t('me.league.rules')}
            onPress={() => setSheet('rules')}
          />
        }
      />
      {!online && league.data ? (
        <Banner
          kind="offline"
          message={t('me.league.offline', {
            time: `${pad(updated.getHours())}:${pad(updated.getMinutes())}`,
          })}
        />
      ) : null}
      {country.data ? <LeagueHeroCard table={country.data} /> : null}
      {myClass ? (
        <PillTabs
          accessibilityLabel={t('me.league.scopeLabel')}
          value={scope}
          onChange={setScope}
          options={[
            { value: 'class', label: t('me.league.scopeClass', { name: myClass.short }) },
            { value: 'country', label: t('me.league.scopeCountry') },
          ]}
        />
      ) : null}
      <View className="flex-row items-center gap-1.5">
        <Icon name="eye" size={16} color="muted" />
        <Text tone="muted" className="flex-1 font-sans-semibold text-sm">
          {t('me.league.nicknameOnly')}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => setSheet('leave')}
          className="min-h-touch justify-center px-1"
        >
          <Text className="font-sans-black text-sm text-honey-text">{t('me.league.leave')}</Text>
        </Pressable>
      </View>
      {league.isPending ? (
        <LoadingState />
      ) : league.isError ? (
        <ErrorState onRetry={() => void league.refetch()} />
      ) : (
        <LeagueStandings table={league.data} scope={scope} />
      )}
      <InfoSheet
        visible={sheet === 'rules'}
        title={t('me.league.rules')}
        paragraphs={[
          t('me.league.rulesBody1'),
          t('me.league.rulesBody2'),
          t('me.league.rulesBody3'),
        ]}
        onClose={() => setSheet(null)}
      />
      <ConfirmSheet
        visible={sheet === 'leave'}
        title={t('me.league.leaveTitle')}
        body={t('me.league.leaveBody')}
        confirmLabel={t('me.league.leave')}
        onConfirm={() => leave(false)}
        onClose={() => setSheet(null)}
      />
    </Screen>
  );
}
