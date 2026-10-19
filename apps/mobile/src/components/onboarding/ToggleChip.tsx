import { Pressable } from 'react-native';
import { Icon, Text } from '@/components/ui';
import { cn } from '@/lib/cn';

type ToggleChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  /** `radio` for one-of-many (exam), `checkbox` for several (a teacher's subjects). */
  role: 'radio' | 'checkbox';
  /** A fuller name for screen readers when the chip is shortened ("II qrup"). */
  accessibilityLabel?: string;
};

/** A 44pt chip with a honey border and a check while selected. */
export function ToggleChip({
  label,
  selected,
  onPress,
  role,
  accessibilityLabel,
}: ToggleChipProps) {
  return (
    <Pressable
      accessibilityRole={role}
      accessibilityState={{ checked: selected }}
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      className={cn(
        'min-h-[44px] flex-row items-center gap-1.5 rounded-md border-2 px-3.5 active:opacity-80',
        selected ? 'border-honey bg-raised' : 'border-border bg-surf',
      )}
    >
      {selected ? <Icon name="check" size={16} color="honey-text" /> : null}
      <Text className="font-sans-bold text-sm">{label}</Text>
    </Pressable>
  );
}
