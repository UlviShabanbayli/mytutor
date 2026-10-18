import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { todayDateLine } from '@/features/today/format';
import { InboxBell } from './InboxBell';
import { StatChip } from './StatChip';

type TodayHeaderProps = {
  streak: number;
  points: number;
};

/** Date and "Bu gün", the flight-day and honey counters, and the inbox bell. */
export function TodayHeader({ streak, points }: TodayHeaderProps) {
  const { t } = useTranslation();

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
