import { useTranslation } from 'react-i18next';
import { RewardView } from '@/components/me/RewardView';
import { demoReward } from '@/features/me/demo';

/** The "new rank" moment (architecture P2, P3); the server will say when it happens. */
export default function RewardScreen() {
  const { t } = useTranslation();
  return (
    <RewardView
      rank={demoReward.rank}
      points={demoReward.points}
      shields={demoReward.shields}
      badgeName={t(`me.badges.${demoReward.badge}.name`)}
    />
  );
}
