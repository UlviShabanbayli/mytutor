import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { StatTile } from '@/components/progress/StatTile';
import { ErrorState, LoadingState, Screen } from '@/components/ui';
import { useMeOverview, useNickname, useParents, useTextbookProgress } from '@/features/me/queries';
import { rankProgress } from '@/features/me/rank';
import { useMeStore } from '@/features/me/store';
import { BadgeStrip } from './BadgeStrip';
import { MeHeader } from './MeHeader';
import { MeMenu } from './MeMenu';
import { RankCard } from './RankCard';

/** The "Mən" tab of a student with an account: rank, stats, badges and the account menu. */
export function MeAccount() {
  const { t } = useTranslation();
  const overview = useMeOverview();
  const textbooks = useTextbookProgress();
  const parent = useParents().data?.links[0] ?? null;
  const nickname = useNickname();
  const leagueJoined = useMeStore((s) => s.leagueJoined);

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

  const me = overview.data;
  const grade = t('common.grade', { count: me.grade, ordinal: true });

  return (
    <Screen className="gap-2.5">
      <MeHeader
        name={me.name}
        subtitle={t('me.home.handle', { nickname, grade })}
        shields={me.shields}
      />
      <RankCard points={me.points} progress={rankProgress(me.rank, me.points, me.nextRank)} />
      <View accessibilityLabel={t('me.home.statsLabel')} className="flex-row gap-2">
        <StatTile icon="wing" value={me.streak} label={t('me.home.streak')} />
        <StatTile icon="drop" value={me.weekPoints} label={t('me.home.weekPoints')} />
        <StatTile icon="learn" value={me.honeyCells} label={t('me.home.honeyCells')} />
      </View>
      <BadgeStrip badges={me.badges} total={me.badgesTotal} />
      <MeMenu
        unread={me.unreadInClasses}
        hasClasses={me.classCount > 0}
        progressValue={textbooks.data?.[0]?.title ?? ''}
        league={leagueJoined ? me.league : null}
        parentName={parent?.name ?? null}
        plan={me.plan}
      />
    </Screen>
  );
}
