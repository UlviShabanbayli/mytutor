import { View } from 'react-native';
import { Icon, type IconName, Text } from '@/components/ui';

type WeekTileProps = {
  icon: IconName;
  value: string;
  label: string;
  /** `ok` marks a fact that is fully fine (all assignments on time). */
  tone?: 'honey' | 'ok';
};

/** One fact of the week on the child's card: icon, bold value, short muted label. */
export function WeekTile({ icon, value, label, tone = 'honey' }: WeekTileProps) {
  return (
    <View
      accessible
      accessibilityLabel={`${value}, ${label}`}
      className="min-w-0 flex-1 gap-0.5 rounded-md bg-raised p-2.5"
    >
      <View className="mb-0.5">
        <Icon name={icon} size={16} color={tone === 'ok' ? 'ok' : 'honey-text'} />
      </View>
      <Text className="font-sans-black text-base">{value}</Text>
      <Text className="font-sans-semibold text-xs text-muted">{label}</Text>
    </View>
  );
}
