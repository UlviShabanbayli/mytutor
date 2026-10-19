import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';
import { cn } from '@/lib/cn';
import { addDays, formatWeekRange } from '@/features/parent/format';

type WeekSwitcherProps = {
  weekStart: Date;
  /** 0 = this week, 1 = last week… */
  offset: number;
  hasPrevious: boolean;
  onChange: (offset: number) => void;
};

/** "‹ 12–18 oktyabr · Bu həftə ›": steps through the weeks that have a report. */
export function WeekSwitcher({ weekStart, offset, hasPrevious, onChange }: WeekSwitcherProps) {
  const { t } = useTranslation();
  const hasNext = offset > 0;
  const caption =
    offset === 0 ? t('parent.report.thisWeek') : offset === 1 ? t('parent.report.lastWeek') : null;

  const arrow = (direction: 'back' | 'chevron', enabled: boolean) => {
    const target = direction === 'back' ? offset + 1 : offset - 1;
    const range = formatWeekRange(t, addDays(weekStart, (offset - target) * 7));
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          direction === 'back'
            ? t('parent.report.previousWeek', { range })
            : t('parent.report.nextWeek', { range })
        }
        accessibilityState={{ disabled: !enabled }}
        disabled={!enabled}
        onPress={() => onChange(target)}
        className={cn(
          'h-[44px] w-[44px] items-center justify-center rounded-md active:bg-wax',
          !enabled && 'opacity-50',
        )}
      >
        <Icon name={direction} size={20} color={enabled ? 'ink' : 'lock-ink'} />
      </Pressable>
    );
  };

  return (
    <View
      accessibilityRole="toolbar"
      accessibilityLabel={t('parent.report.weekGroup')}
      className="flex-row items-center gap-1.5 rounded-lg border border-border bg-surf p-0.5"
    >
      {arrow('back', hasPrevious)}
      <View className="min-w-0 flex-1 items-center gap-px" accessibilityLiveRegion="polite">
        <Text className="font-sans-black">{formatWeekRange(t, weekStart)}</Text>
        {caption ? <Text className="font-sans-semibold text-xs text-muted">{caption}</Text> : null}
      </View>
      {arrow('chevron', hasNext)}
    </View>
  );
}
