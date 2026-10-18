import { View } from 'react-native';
import { Icon, Text, type IconName } from '@/components/ui';

type StatChipProps = {
  icon: IconName;
  value: number;
  /** Read instead of the number, e.g. "Uçuş günləri: 12". */
  accessibilityLabel: string;
};

/** Header counter on a warm chip: flight days (wing) or honey points (drop). */
export function StatChip({ icon, value, accessibilityLabel }: StatChipProps) {
  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel}
      className="h-[36px] flex-row items-center gap-1 rounded-sm bg-raised px-2.5"
    >
      <Icon name={icon} size={20} color="honey-text" />
      <Text className="font-sans-black text-base text-honey-text">{value}</Text>
    </View>
  );
}
