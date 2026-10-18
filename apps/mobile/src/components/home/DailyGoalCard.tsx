import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card, Icon, ProgressBar, Text } from '@/components/ui';
import { DAILY_GOAL, answeredToday, useTestSessionStore } from '@/features/tests/sessionStore';

/** "Today": questions answered against the daily goal. */
export function DailyGoalCard() {
  const { t } = useTranslation();
  const results = useTestSessionStore((s) => s.results);
  const done = Math.min(answeredToday(results), DAILY_GOAL);
  const complete = done >= DAILY_GOAL;
  const progressLabel = t('home.dailyGoalProgress', { done, goal: DAILY_GOAL });

  return (
    <View className="gap-2.5">
      <View className="flex-row items-baseline justify-between">
        <Text variant="subheading" accessibilityRole="header">
          {t('home.todayTitle')}
        </Text>
        <Text variant="label" tone="muted">
          {progressLabel}
        </Text>
      </View>
      <Card className="flex-row items-center gap-3">
        <View
          className={
            complete
              ? 'h-10 w-10 items-center justify-center rounded-full bg-ok'
              : 'h-10 w-10 items-center justify-center rounded-full bg-raised'
          }
        >
          <Icon
            name={complete ? 'check' : 'bolt'}
            size={20}
            color={complete ? 'page' : 'honey-text'}
          />
        </View>
        <View className="flex-1 gap-2">
          <Text variant="label">
            {complete ? t('home.dailyGoalDone') : t('home.dailyGoalHint', { goal: DAILY_GOAL })}
          </Text>
          <ProgressBar
            value={done / DAILY_GOAL}
            tone={complete ? 'ok' : 'honey'}
            accessibilityLabel={progressLabel}
          />
        </View>
      </Card>
    </View>
  );
}
