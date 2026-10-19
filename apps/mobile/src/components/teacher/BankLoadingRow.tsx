import { View } from 'react-native';
import { Text } from '@/components/ui';

type BankLoadingRowProps = { label: string };

/** A skeleton row while questions load (design "Daha çox sual yüklənir…"). */
export function BankLoadingRow({ label }: BankLoadingRowProps) {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      className="flex-row items-center gap-3 rounded-lg border border-border bg-surf p-3"
    >
      <View className="h-[26px] w-[26px] rounded-[8px] bg-wax" />
      <View className="flex-1 gap-1.5">
        <View className="h-3 w-4/5 rounded-full bg-wax" />
        <Text className="font-sans-bold text-xs text-muted">{label}</Text>
      </View>
    </View>
  );
}
