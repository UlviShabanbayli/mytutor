import { View } from 'react-native';
import { NumberRoll } from '@/components/feedback/NumberRoll';
import { Icon, type IconName, RollingNumber } from '@/components/ui';
import type { Rise } from './useRiseSinceSeen';

type StatChipProps = {
  icon: IconName;
  value: number;
  /** Read instead of the number, e.g. "Uçuş günləri: 12". */
  accessibilityLabel: string;
  /** The number just went up: it rolls from the old value (feedback.streak C). */
  roll?: { rise: Rise; at: number } | null;
};

const numberClass = 'font-sans-black text-base text-honey-text';

/**
 * Header counter on a warm chip: flight days (wing) or honey points (drop). A new streak day
 * rolls on the streak moment's own timing; any other change rolls like every number (micro.count).
 */
export function StatChip({ icon, value, accessibilityLabel, roll }: StatChipProps) {
  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel}
      className="h-[36px] flex-row items-center gap-1 rounded-sm bg-raised px-2.5"
    >
      <Icon name={icon} size={20} color="honey-text" />
      {roll ? (
        <NumberRoll
          key={roll.rise.key}
          from={roll.rise.from}
          to={value}
          delay={roll.at}
          className={numberClass}
        />
      ) : (
        <RollingNumber value={value} accessible={false} className={numberClass} />
      )}
    </View>
  );
}
