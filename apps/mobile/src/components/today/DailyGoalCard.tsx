import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import type { Motivation } from '@/features/today/hooks';
import { GoalRing } from './GoalRing';
import { WeekHexRow } from './WeekHexRow';

type DailyGoalCardProps = {
  motivation: Motivation;
  firstDay: boolean;
};

/**
 * Minutes against the daily goal and the week's flight days. Once the goal is reached the card
 * opens today's celebration again.
 */
export function DailyGoalCard({ motivation, firstDay }: DailyGoalCardProps) {
  const { t } = useTranslation();
  const { progress, flightDay } = motivation;
  const day = t('today.goal.flightDay', { count: flightDay, ordinal: true });
  const note = firstDay
    ? t('today.goal.firstDay')
    : progress.complete
      ? t('today.goal.done', { day })
      : progress.done > 0
        ? t('today.goal.left', { count: progress.left, day })
        : t('today.goal.notStarted');

  const card = (
    <View className="gap-3 rounded-xl border border-border bg-surf p-3.5">
      <View className="flex-row items-center gap-3.5">
        <GoalRing progress={progress} />
        <View className="flex-1 gap-0.5">
          <Text variant="subheading" accessibilityRole="header">
            {t('today.goal.title')}
          </Text>
          <Text tone="muted" className="text-sm">
            {note}
          </Text>
        </View>
      </View>
      <WeekHexRow week={motivation.week} />
    </View>
  );

  if (!progress.complete) return card;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${t('today.goal.title')}. ${note}`}
      accessibilityHint={t('today.goal.openDone')}
      onPress={() => router.push('/goal-done')}
      className="rounded-xl active:opacity-80"
    >
      {card}
    </Pressable>
  );
}
