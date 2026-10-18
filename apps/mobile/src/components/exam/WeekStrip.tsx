import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';
import { addDays } from '@/features/exam/calendar';
import { dayMonth, stepsLabel, weekdayShort } from '@/features/exam/labels';
import type { PlanDay } from '@/features/exam/types';
import { cn } from '@/lib/cn';
import { DayMarkDot } from './DayMarkDot';

type WeekStripProps = {
  days: PlanDay[];
  today: Date;
};

/** The rolling week around today: steps done, planned and moved; a missed day is crossed. */
export function WeekStrip({ days, today }: WeekStripProps) {
  const { t } = useTranslation();

  return (
    <View className="gap-2">
      <View accessibilityLabel={t('exam.plan.weekA11y')} className="flex-row gap-1">
        {days.map((day) => {
          const date = addDays(today, day.offset);
          const isToday = day.offset === 0;
          const name = dayMonth(t, date);
          const label = day.missed
            ? t('exam.plan.dayMissed', { date: name })
            : t('exam.plan.daySteps', {
                date: isToday ? t('exam.plan.dayToday', { date: name }) : name,
                steps: stepsLabel(t, day.marks.length),
                marks: day.marks.map((m) => t(`exam.plan.marks.${m}`)).join(', '),
              });
          return (
            <View
              key={day.offset}
              accessible
              accessibilityLabel={label}
              className={cn(
                'min-h-[76px] min-w-0 flex-1 items-center justify-center gap-1 rounded-md py-1.5',
                isToday
                  ? 'border-2 border-honey bg-honey'
                  : day.missed
                    ? 'border-2 border-dashed border-err bg-err-bg'
                    : 'border border-border bg-surf',
              )}
            >
              <Text
                className={cn(
                  'font-sans-black text-2xs',
                  isToday ? 'text-on-honey' : day.missed ? 'text-err' : 'text-muted',
                )}
              >
                {weekdayShort(t, date)}
              </Text>
              <Text
                className={cn(
                  'font-display-black text-base',
                  isToday
                    ? 'text-on-honey'
                    : day.missed
                      ? 'text-err'
                      : day.offset < 0
                        ? 'text-muted'
                        : 'text-ink',
                )}
              >
                {String(date.getDate())}
              </Text>
              <View className="h-3 flex-row items-center justify-center gap-[3px]">
                {day.missed ? <Icon name="x" size={12} color="err" /> : null}
                {day.marks.map((mark, i) => (
                  <DayMarkDot key={i} mark={mark} onHoney={isToday} />
                ))}
              </View>
            </View>
          );
        })}
      </View>
      <View
        accessibilityLabel={t('exam.plan.legendA11y')}
        className="flex-row flex-wrap items-center gap-x-3 gap-y-1"
      >
        {(['done', 'plan', 'moved'] as const).map((mark) => (
          <View key={mark} className="flex-row items-center gap-1.5">
            <DayMarkDot mark={mark} />
            <Text tone="muted" className="font-sans-semibold text-xs">
              {t(`exam.plan.marks.${mark}`)}
            </Text>
          </View>
        ))}
        <View className="flex-row items-center gap-1">
          <Icon name="x" size={12} color="err" />
          <Text tone="muted" className="font-sans-semibold text-xs">
            {t('exam.plan.missed')}
          </Text>
        </View>
      </View>
    </View>
  );
}
