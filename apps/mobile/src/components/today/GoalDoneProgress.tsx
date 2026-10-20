import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { NumberRoll } from '@/components/feedback/NumberRoll';
import { goalC } from '@/components/feedback/timelines';
import { Icon, Text } from '@/components/ui';
import { goalProgress } from '@/features/today/goal';
import { GoalRing } from './GoalRing';
import { goalCheckAt } from './useGoalRingMotion';

type GoalDoneProgressProps = {
  /** The daily goal in minutes, reached today. */
  goal: number;
  /** Today's flight day; it rolls in from the day before. */
  flightDay: number;
};

/**
 * The goal-done moment's card: the ring completes (feedback.goal C: a drop rides the last quarter,
 * falls in, honey rises, check) and the flight day rolls up (feedback.streak C; Vızı already
 * celebrates on this screen, so she does not fly here as well).
 */
export function GoalDoneProgress({ goal, flightDay }: GoalDoneProgressProps) {
  const { t } = useTranslation();
  return (
    // White at 45% over honey: the design's one allowed overlay on honey backgrounds.
    <View className="flex-row items-center gap-3.5 self-stretch rounded-xl bg-white/45 p-3">
      <GoalRing
        progress={goalProgress(goal, goal)}
        size={88}
        tone="honey"
        celebrateFrom={goalC.from}
      />
      <View className="min-w-0 flex-1 gap-1">
        <Text className="font-sans-black text-md text-on-honey">{t('today.goal.title')}</Text>
        <View
          accessible
          accessibilityLabel={t('today.header.streak', { count: flightDay })}
          className="flex-row items-center gap-1.5"
        >
          <Icon name="wing" size={22} color="on-honey" />
          <NumberRoll
            from={Math.max(0, flightDay - 1)}
            to={flightDay}
            delay={goalCheckAt}
            className="font-display-black text-2xl text-on-honey"
          />
          <Text className="min-w-0 flex-1 font-sans-bold text-sm text-on-honey">
            {t('today.goalDone.streak', { count: flightDay })}
          </Text>
        </View>
      </View>
    </View>
  );
}
