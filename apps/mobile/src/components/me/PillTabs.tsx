import { Pressable, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { Text, useSegmentIndicator } from '@/components/ui';
import { playCue } from '@/lib/cues';
import { cn } from '@/lib/cn';

type PillTab<T extends string> = { value: T; label: string; dotLabel?: string };

type PillTabsProps<T extends string> = {
  options: readonly PillTab<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
  className?: string;
};

/**
 * Mutually exclusive sections on a warm `raised` strip, the chosen one a white pill that slides
 * like the segmented control's indicator (design: league scope, class sections). The shared
 * SegmentedControl is honey-filled instead.
 */
export function PillTabs<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
  className,
}: PillTabsProps<T>) {
  const { indicatorStyle, onSegmentLayout } = useSegmentIndicator(
    options.findIndex((o) => o.value === value),
  );

  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      className={cn('flex-row gap-0.5 rounded-md bg-raised p-1', className)}
    >
      <View pointerEvents="none" className="absolute inset-x-0 inset-y-1 flex-row">
        <Animated.View style={indicatorStyle}>
          <View className="flex-1 rounded-[11px] bg-surf shadow-sm shadow-shadow" />
        </Animated.View>
      </View>
      {options.map((o, i) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="tab"
            accessibilityLabel={o.dotLabel ? `${o.label}, ${o.dotLabel}` : o.label}
            accessibilityState={{ selected }}
            onLayout={onSegmentLayout(i)}
            onPress={() => {
              if (!selected) playCue('select');
              onChange(o.value);
            }}
            // 40pt pills inside the 4pt strip padding; the slop keeps the target at 48pt.
            hitSlop={4}
            className={cn(
              'h-10 flex-1 items-center justify-center rounded-[11px] px-1',
              !selected && 'active:bg-surf/50',
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
