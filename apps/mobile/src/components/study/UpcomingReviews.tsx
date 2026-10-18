import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';
import { shortDate, weekday } from '@/features/study/dates';
import { addDays } from '@/features/study/time';
import type { ReviewPlan } from '@/features/study/types';
import { cn } from '@/lib/cn';

/** "Növbəti təkrarlar": the coming days and which cells they bring; a free day says so. */
export function UpcomingReviews({ plan, now = new Date() }: { plan: ReviewPlan; now?: Date }) {
  const { t } = useTranslation();

  return (
    <View className="gap-1.5">
      <Text variant="overline" tone="muted" className="pb-0.5 text-xs" accessibilityRole="header">
        {t('study.review.upcoming')}
      </Text>
      {plan.upcoming.map((day) => {
        const date = addDays(now, day.inDays);
        const label =
          day.inDays === 1
            ? t('study.review.tomorrow', { date: shortDate(t, date) })
            : t('study.review.day', { weekday: weekday(t, date), date: shortDate(t, date) });
        const empty = day.cells.length === 0;
        return (
          <View
            key={day.inDays}
            accessible
            className={cn(
              'min-h-12 flex-row items-center gap-2.5 rounded-md px-3 py-2',
              empty ? 'border border-dashed border-border' : 'border border-border bg-surf',
            )}
          >
            <Icon name="calendar" size={20} color={empty ? 'lock-ink' : 'muted'} />
            <Text className={cn('min-w-0 flex-1 font-sans-bold text-sm', empty && 'text-lock-ink')}>
              {label}
            </Text>
            <Text variant="caption" tone={empty ? 'lock' : 'muted'}>
              {empty
                ? t('study.review.rest')
                : t('study.review.cells', { codes: day.cells.join(', '), count: day.cells.length })}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
