import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { StatTile } from '@/components/progress/StatTile';
import { ErrorState, LoadingState, Screen } from '@/components/ui';
import { useAppStore } from '@/features/app/appStore';
import { RANK_THRESHOLDS } from '@/features/me/demo';
import { useMeOverview, useTextbookProgress } from '@/features/me/queries';
import { rankProgress } from '@/features/me/rank';
import { useMeStore } from '@/features/me/store';
import { streakDays } from '@/features/tests/progress';
import { useTestSessionStore } from '@/features/tests/sessionStore';
import { BadgeStrip } from './BadgeStrip';
import { MeHeader } from './MeHeader';
import { MeMenu } from './MeMenu';
import { RankCard } from './RankCard';

/** The "Mən" tab of a student with an account: rank, stats, badges and the account menu. */
export function MeAccount() {
  const { t } = useTranslation();
  const overview = useMeOverview();
  const textbooks = useTextbookProgress();
  const results = useTestSessionStore((s) => s.results);
  const profileGrade = useAppStore((s) => s.profile.grade);
  const nickname = useMeStore((s) => s.nickname);
  const leagueJoined = useMeStore((s) => s.leagueJoined);
  const parent = useMeStore((s) => s.parentLinks[0] ?? null);

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
  const grade = t('common.grade', { count: profileGrade ?? me.grade, ordinal: true });

  return (
    <Screen className="gap-2.5">
      <MeHeader
        name={me.name}
        subtitle={t('me.home.handle', { nickname, grade })}
        shields={me.shields}
      />
      <RankCard points={me.points} progress={rankProgress(me.points, RANK_THRESHOLDS)} />
      <View accessibilityLabel={t('me.home.statsLabel')} className="flex-row gap-2">
        {/* Day streak is real (finished tests); points and cells are demo until P2 exists. */}
        <StatTile icon="wing" value={streakDays(results)} label={t('me.home.streak')} />
        <StatTile icon="drop" value={me.weekPoints} label={t('me.home.weekPoints')} />
        <StatTile icon="learn" value={me.honeyCells} label={t('me.home.honeyCells')} />
      </View>
      <BadgeStrip badges={me.badges} total={me.badgesTotal} />
      <MeMenu
        unread={me.unreadInClasses}
        progressValue={textbooks.data?.[0]?.title ?? ''}
        league={leagueJoined ? me.league : null}
        parentName={parent?.name ?? null}
        plan={me.plan}
      />
    </Screen>
  );
}
