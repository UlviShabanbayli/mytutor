import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { streakC } from '@/components/feedback/timelines';
import { todayDateLine } from '@/features/today/format';
import { InboxBell } from './InboxBell';
import { StatChip } from './StatChip';
import { useRiseSinceSeen } from './useRiseSinceSeen';

type TodayHeaderProps = {
  streak: number;
  points: number;
};

/** Date and "Bu gün", the flight-day and honey counters, and the inbox bell. */
export function TodayHeader({ streak, points }: TodayHeaderProps) {
  const { t } = useTranslation();
  // A new flight day rolls in while Vızı flies over the week (feedback.streak C).
  const rise = useRiseSinceSeen(streak);

  return (
    <View className="flex-row items-end gap-2 pb-1">
      <View className="flex-1 gap-0.5">
        <Text className="font-sans-black text-xs uppercase tracking-[1px] text-muted">
          {todayDateLine(t, new Date())}
        </Text>
        <Text variant="title" numberOfLines={1}>
          {t('today.title')}
        </Text>
      </View>
      <StatChip
        icon="wing"
        value={streak}
        accessibilityLabel={t('today.header.streak', { count: streak })}
        roll={rise ? { rise, at: streakC.startAt + streakC.rollAt } : null}
      />
      <StatChip
        icon="drop"
        value={points}
        accessibilityLabel={t('today.header.points', { count: points })}
      />
      <InboxBell />
    </View>
  );
}
