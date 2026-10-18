import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card, Text } from '@/components/ui';
import { todayIndex, weekActivity } from '@/features/tests/progress';
import { useTestSessionStore } from '@/features/tests/sessionStore';
import { cn } from '@/lib/cn';

/** This week, Monday first: a filled dot for each day with a finished test. */
export function WeekActivity() {
  const { t } = useTranslation();
  const results = useTestSessionStore((s) => s.results);
  const week = weekActivity(results);
  const today = todayIndex();
  const done = week.filter(Boolean).length;

  return (
    <Card className="gap-3">
      <View className="flex-row items-baseline justify-between">
        <Text variant="subheading" accessibilityRole="header">
          {t('progress.weekTitle')}
        </Text>
        <Text variant="label" tone="muted">
          {t('progress.weekDays', { done })}
        </Text>
      </View>
      <View className="flex-row justify-between">
        {week.map((active, i) => {
          const day = t(`progress.weekDayNames.${i}` as 'progress.weekDayNames.0');
          return (
            <View
              key={day}
              accessible
              accessibilityLabel={t(active ? 'progress.weekDayDone' : 'progress.weekDayEmpty', {
                day,
              })}
              className="items-center gap-1.5"
            >
              {/* Today keeps a halo, visible whether or not the dot is filled. */}
              <View className={cn('rounded-full p-[3px]', i === today && 'bg-raised')}>
                <View
                  className={cn(
                    'h-8 w-8 rounded-full',
                    active ? 'bg-honey' : 'bg-wax',
                    i === today && 'border-2 border-honey',
                  )}
                />
              </View>
              <Text variant="caption" tone={i === today ? 'default' : 'muted'}>
                {day}
              </Text>
            </View>
          );
        })}
      </View>
    </Card>
  );
}
