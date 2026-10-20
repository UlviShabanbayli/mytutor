import { useTranslation } from 'react-i18next';
import { RewardView } from '@/components/me/RewardView';
import { ErrorState, LoadingState, Screen } from '@/components/ui';
import { useReward } from '@/features/me/queries';

/** The "new rank" moment (architecture P2, P3): the student's next rank in the demo world. */
export default function RewardScreen() {
  const { t } = useTranslation();
  const reward = useReward();

  if (reward.isPending || reward.isError)
    return (
      <Screen>
        {reward.isError ? <ErrorState onRetry={() => void reward.refetch()} /> : <LoadingState />}
      </Screen>
    );
  return (
    <RewardView
      rank={reward.data.rank}
      points={reward.data.points}
      shields={reward.data.shields}
      badgeName={t(`me.badges.${reward.data.badge}.name`)}
    />
  );
}
