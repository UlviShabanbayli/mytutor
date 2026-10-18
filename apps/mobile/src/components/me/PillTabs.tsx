import { Pressable, View } from 'react-native';
import { cn } from '@/lib/cn';
import { Text } from '@/components/ui';

type PillTab<T extends string> = { value: T; label: string; dotLabel?: string };

type PillTabsProps<T extends string> = {
  options: readonly PillTab<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
  /** `compact`: segments as wide as their words, for a settings row (design "Görünüş"). */
  compact?: boolean;
  className?: string;
};

/**
 * Mutually exclusive choices on a warm `raised` strip, the chosen one a white pill (design:
 * league scope, class sections, settings). The shared SegmentedControl is honey-filled instead.
 */
export function PillTabs<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
  compact = false,
  className,
}: PillTabsProps<T>) {
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      className={cn('flex-row gap-0.5 rounded-md bg-raised p-1', className)}
    >
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="tab"
            accessibilityLabel={o.dotLabel ? `${o.label}, ${o.dotLabel}` : o.label}
            accessibilityState={{ selected }}
            onPress={() => onChange(o.value)}
            // 40pt pills inside the 4pt strip padding; the slop keeps the target at 48pt.
            hitSlop={4}
            className={cn(
              'h-10 items-center justify-center rounded-[11px]',
              compact ? 'px-2.5' : 'flex-1 px-1',
              selected ? 'bg-surf shadow-sm shadow-shadow' : 'active:bg-surf/50',
            )}
          >
            <Text
              numberOfLines={1}
              className={cn(
                'text-sm',
                selected ? 'font-sans-black text-ink' : 'font-sans-bold text-muted',
              )}
            >
              {o.label}
            </Text>
            {o.dotLabel ? (
              <View className="absolute right-2 top-2 h-2 w-2 rounded-full bg-err" />
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}
