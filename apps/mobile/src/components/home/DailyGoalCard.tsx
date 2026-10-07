import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, ProgressBar, Text } from '@/components/ui';
import { DAILY_GOAL, answeredToday, useTestSessionStore } from '@/features/tests/sessionStore';

export function DailyGoalCard() {
  const { t } = useTranslation();
  const results = useTestSessionStore((s) => s.results);
  const done = Math.min(answeredToday(results), DAILY_GOAL);
  const complete = done >= DAILY_GOAL;
  const progressLabel = t('home.dailyGoalProgress', { done, goal: DAILY_GOAL });

  return (
    <View className="gap-3 rounded-lg bg-accent-muted p-4">
      <View className="flex-row items-center gap-3">
        <View className="h-11 w-11 items-center justify-center rounded-full bg-accent">
          <Icon name="flame" size={24} color="accent-foreground" />
        </View>
        <View className="flex-1">
          <Text variant="subheading">{t('home.dailyGoalTitle')}</Text>
          <Text variant="label">{complete ? t('home.dailyGoalDone') : progressLabel}</Text>
        </View>
      </View>
      <ProgressBar
        value={done / DAILY_GOAL}
        tone="accent"
        accessibilityLabel={progressLabel}
        className="bg-card"
      />
    </View>
  );
}
