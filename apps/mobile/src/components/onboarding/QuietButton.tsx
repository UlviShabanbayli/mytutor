import { Pressable } from 'react-native';
import { Text } from '@/components/ui';

type QuietButtonProps = {
  label: string;
  onPress: () => void;
};

/** A muted 48pt text action for "not now" choices ("Sonra", "Lazım deyil"). */
export function QuietButton({ label, onPress }: QuietButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="min-h-touch items-center justify-center rounded-lg px-4 active:opacity-70"
    >
      <Text className="font-sans-bold" tone="muted">
        {label}
      </Text>
    </Pressable>
  );
}
