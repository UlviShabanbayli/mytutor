import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui';
import { cn } from '@/lib/cn';

type Chip<T extends string | number> = { value: T; label: string; accessibilityLabel?: string };

type ChipGroupProps<T extends string | number> = {
  chips: readonly Chip<T>[];
  value: T | null;
  onChange: (value: T) => void;
  /** Names the group for screen readers ("Qəbul qrupu"). */
  accessibilityLabel: string;
};

/** A row of equal chips, one of which is chosen (group I–V, target result, daily minutes). */
export function ChipGroup<T extends string | number>({
  chips,
  value,
  onChange,
  accessibilityLabel,
}: ChipGroupProps<T>) {
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      className="flex-row gap-1.5"
    >
      {chips.map((chip) => {
        const selected = chip.value === value;
        return (
          <Pressable
            key={String(chip.value)}
            accessibilityRole="radio"
            accessibilityLabel={chip.accessibilityLabel ?? chip.label}
            accessibilityState={{ checked: selected }}
            onPress={() => onChange(chip.value)}
            className={cn(
              'min-h-touch min-w-0 flex-1 items-center justify-center rounded-md border-2 px-1',
              selected ? 'border-honey bg-raised' : 'border-border bg-surf active:bg-wax',
            )}
          >
            <Text
              numberOfLines={1}
              className={cn('font-sans-black text-sm', selected ? 'text-honey-text' : 'text-ink')}
            >
              {chip.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
