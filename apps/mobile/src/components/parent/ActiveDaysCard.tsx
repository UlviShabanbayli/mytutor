import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { HexCell, Text } from '@/components/ui';
import { weekdayName } from '@/features/parent/format';
import { ReportTile, TileValue } from './ReportTile';

type ActiveDaysCardProps = { days: boolean[] };

/** Seven small cells, Monday first: honey on days with learning, wax on the others. */
export function ActiveDaysCard({ days }: ActiveDaysCardProps) {
  const { t } = useTranslation();
  const count = days.filter(Boolean).length;
  const spoken = days
    .map((on, i) =>
      t(on ? 'parent.report.dayActive' : 'parent.report.dayIdle', {
        day: weekdayName(t, i, true),
      }),
    )
    .join(', ');

  return (
    <ReportTile
      icon="calendar"
      label={t('parent.report.activeDays')}
      accessibilityLabel={`${t('parent.report.activeDaysAria', { count })}. ${spoken}`}
    >
      <View className="flex-row items-center gap-3">
        <TileValue>{`${count} / ${days.length}`}</TileValue>
        <View className="min-w-0 flex-1 flex-row justify-between">
          {days.map((on, i) => (
            <View key={i} className="items-center gap-[3px]">
              <HexCell state={on ? 'mastered' : 'not_started'} size={22} />
              <Text className="font-sans-black text-2xs text-muted">{weekdayName(t, i)}</Text>
            </View>
          ))}
        </View>
      </View>
    </ReportTile>
  );
}
