import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { weekdayName } from '@/features/today/format';
import type { DayCell } from '@/features/today/goal';
import { HexShape } from './HexShape';

type WeekHexRowProps = {
  week: DayCell[];
};

// Today keeps a honey rim: nectar inside once started, the bare surface before that.
const rim = { done: 'honey', todayStarted: 'honey', today: 'honey', empty: 'wax' } as const;
const core = { done: 'honey', todayStarted: 'nectar', today: 'surf', empty: 'wax' } as const;

/** Monday to Sunday as hexagons: honey for flight days, a honey rim around today. */
export function WeekHexRow({ week }: WeekHexRowProps) {
  const { t } = useTranslation();

  return (
    <View role="list" aria-label={t('today.goal.weekLabel')} className="flex-row justify-between">
      {week.map((cell, i) => {
        const isToday = cell === 'today' || cell === 'todayStarted';
        const day = weekdayName(t, i);
        const label =
          cell === 'done'
            ? t('today.goal.dayDone', { day })
            : isToday
              ? t('today.goal.dayToday', { day })
              : day;
        return (
          <View
            key={day}
            role="listitem"
            accessible
            accessibilityLabel={label}
            className="flex-1 items-center gap-1"
          >
            <HexShape width={30} height={34} fill={rim[cell]}>
              <HexShape width={22} height={25} fill={core[cell]} />
            </HexShape>
            <Text
              className={
                isToday
                  ? 'font-sans-black text-2xs text-ink'
                  : 'font-sans-black text-2xs text-muted'
              }
            >
              {weekdayName(t, i, true)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
