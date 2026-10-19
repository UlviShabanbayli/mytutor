import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { answeredPerDay, chartMax, goalDays, weekAccuracy } from '@/features/me/weekStats';
import { todayIndex } from '@/features/tests/progress';
import { DAILY_GOAL, useTestSessionStore } from '@/features/tests/sessionStore';
import { cn } from '@/lib/cn';

const DAYS = ['0', '1', '2', '3', '4', '5', '6'] as const;
const BAR_AREA = 72;

/**
 * This week from the real results: questions answered, accuracy, days that reached the daily
 * goal, and a bar per day (Monday first) with the goal as a dashed line.
 */
export function WeekActivity() {
  const { t } = useTranslation();
  const results = useTestSessionStore((s) => s.results);
  const perDay = answeredPerDay(results);
  const week = weekAccuracy(results);
  const max = chartMax(perDay, DAILY_GOAL);
  const today = todayIndex();
  const dayName = (i: number) => t(`me.when.daysShort.${DAYS[i] ?? '0'}`);
  const goalBottom = Math.round((DAILY_GOAL / max) * BAR_AREA);

  const stats = [
    [t('me.progress.weekAnswered', { count: week.answered }), t('me.progress.weekAnsweredLabel')],
    [
      week.percent === null ? t('me.progress.noValue') : `${week.percent}%`,
      t('me.progress.weekAccuracyLabel'),
    ],
    [
      t('me.progress.weekGoalDays', { done: goalDays(perDay, DAILY_GOAL) }),
      t('me.progress.weekGoalLabel'),
    ],
  ] as const;

  return (
    <View
      accessibilityLabel={t('me.progress.weekLabel')}
      className="gap-2 rounded-xl border border-border bg-surf px-3.5 py-3"
    >
      <View className="flex-row gap-2">
        {stats.map(([value, label]) => (
          <View key={label} accessible className="flex-1 gap-px">
            <Text className="font-display-black text-base">{value}</Text>
            <Text tone="muted" className="font-sans-bold text-2xs">
              {label}
            </Text>
          </View>
        ))}
      </View>
      <View
        accessible
        accessibilityRole="image"
        accessibilityLabel={t('me.progress.chartAria', {
          days: perDay
            .map((n, i) => t('me.progress.chartDay', { day: dayName(i), count: n }))
            .join(', '),
          goal: DAILY_GOAL,
        })}
        className="h-[84px] flex-row items-end gap-2"
      >
        {/* The goal line sits at the data-driven height of the daily goal. */}
        <View
          className="absolute left-0 right-0 border-t-2 border-dashed border-border"
          style={{ bottom: goalBottom + 12 }}
        />
        <View className="absolute right-0 bg-surf px-0.5" style={{ bottom: goalBottom + 14 }}>
          <Text tone="muted" className="font-sans-black text-[10px]">
            {t('me.progress.goalLine', { count: DAILY_GOAL })}
          </Text>
        </View>
        {perDay.map((n, i) => (
          <View key={DAYS[i]} className="h-[84px] flex-1 items-center justify-end gap-0.5">
            <Text tone="muted" className="font-sans-black text-[10px]">
              {n > 0 ? String(n) : t('me.progress.noValue')}
            </Text>
            <View
              className={cn(
                'w-full max-w-[30px] rounded-t-lg rounded-b-[4px]',
                n === 0 ? 'bg-wax' : n >= DAILY_GOAL ? 'bg-honey' : 'bg-nectar',
                i === today && 'border-2 border-dashed border-honey-deep',
              )}
              // Bar height is the day's share of the chart's maximum.
              style={{ height: n > 0 ? Math.max(6, Math.round((n / max) * BAR_AREA)) : 4 }}
            />
          </View>
        ))}
      </View>
      <View className="flex-row gap-2" importantForAccessibility="no-hide-descendants">
        {DAYS.map((d, i) => (
          <Text
            key={d}
            className={cn(
              'flex-1 text-center font-sans-black text-2xs',
              i === today ? 'text-ink' : 'text-muted',
            )}
          >
            {dayName(i)}
          </Text>
        ))}
      </View>
    </View>
  );
}
