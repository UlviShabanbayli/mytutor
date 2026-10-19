import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui';
import { cn } from '@/lib/cn';

type FilterTabsProps<T extends string> = {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
};

/** Filter chips on a wax track; the chosen one is a white raised chip (design "Süzgəc"). */
export function FilterTabs<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: FilterTabsProps<T>) {
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      className="flex-row gap-1 rounded-md bg-wax p-1"
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityLabel={option.label}
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            className={cn(
              'min-h-[44px] flex-1 items-center justify-center rounded-[11px] px-1',
              selected ? 'border-b border-border bg-surf' : 'active:bg-surf/60',
            )}
          >
            <Text
              numberOfLines={1}
              className={cn(
                'text-sm',
                selected ? 'font-sans-black text-ink' : 'font-sans-bold text-muted',
              )}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
