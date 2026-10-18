import { router } from 'expo-router';
import { Pressable } from 'react-native';
import { Icon, Text, type IconName } from '@/components/ui';

type AskViziChipProps = {
  label: string;
  icon?: IconName;
  onPress?: () => void;
};

/** Outlined pill that opens a question to Vızı (AI chat) or another helper. */
export function AskViziChip({ label, icon = 'chat', onPress }: AskViziChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress ?? (() => router.push('/chat'))}
      className="min-h-touch flex-row items-center gap-2 self-start rounded-full border-2 border-border bg-surf pl-2.5 pr-3.5 active:bg-wax"
    >
      <Icon name={icon} size={18} color="honey-text" />
      <Text className="font-sans-bold text-sm">{label}</Text>
    </Pressable>
  );
}
