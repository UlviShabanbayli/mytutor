import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { EmptyState, Icon, Text } from '@/components/ui';
import { REWARD_PLACES } from '@/features/exam/rules';
import type { Leaderboard } from '@/features/exam/types';
import { LeaderboardRow } from './LeaderboardRow';

type LeaderboardListProps = {
  board: Leaderboard;
};

/** The top places, then the places just above the student's (with "···" between). */
export function LeaderboardList({ board }: LeaderboardListProps) {
  const { t } = useTranslation();
  const lastTop = board.top[board.top.length - 1]?.rank ?? 0;
  const gap = (board.around[0]?.rank ?? lastTop + 1) > lastTop + 1;

  if (board.top.length === 0)
    return (
      <EmptyState
        moment="reward"
        title={t('exam.board.emptyTitle')}
        description={t('exam.board.emptyBody')}
      />
    );

  return (
    <View className="gap-2">
      <View
        accessibilityRole="summary"
        className="flex-row items-center gap-2.5 rounded-md bg-info-bg px-3 py-2"
      >
        <Icon name="eye" size={20} color="info" />
        <Text className="min-w-0 flex-1 text-xs">{t('exam.board.joined')}</Text>
      </View>
      <View className="flex-row items-center gap-2.5 rounded-md bg-raised px-3 py-2">
        <Icon name="gift" size={20} color="honey-text" />
        <Text className="min-w-0 flex-1 text-xs">
          <Text className="font-sans-black text-xs">
            {t('exam.board.rewardBold', { count: REWARD_PLACES })}
          </Text>
          {t('exam.board.rewardRest')}
        </Text>
      </View>
      <View
        accessibilityLabel={t(
          board.scope === 'class' ? 'exam.board.listClass' : 'exam.board.listCountry',
        )}
        className="gap-1.5"
      >
        {board.top.map((entry) => (
          <LeaderboardRow key={entry.rank} entry={entry} />
        ))}
        {gap ? (
          <Text
            accessibilityElementsHidden
            className="text-center font-sans-black text-base tracking-[4px] text-muted"
          >
            ···
          </Text>
        ) : null}
        {board.around.map((entry) => (
          <LeaderboardRow key={entry.rank} entry={entry} />
        ))}
      </View>
    </View>
  );
}
