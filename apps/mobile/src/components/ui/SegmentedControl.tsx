import { Pressable, View } from 'react-native';
import { cn } from '@/lib/cn';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

type Segment<T extends string> = { value: T; label: string; icon?: IconName };

type SegmentedControlProps<T extends string> = {
  segments: readonly Segment<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Names the group for screen readers, e.g. "Görünüş". */
  accessibilityLabel: string;
  className?: string;
};

/** A small set of mutually exclusive choices shown side by side (a radio group). */
export function SegmentedControl<T extends string>({
  segments,
  value,
  onChange,
  accessibilityLabel,
  className,
}: SegmentedControlProps<T>) {
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      className={cn('flex-row gap-1 rounded-md bg-muted p-1', className)}
    >
      {segments.map((segment) => {
        const selected = segment.value === value;
        return (
          <Pressable
            key={segment.value}
            accessibilityRole="radio"
            accessibilityLabel={segment.label}
            accessibilityState={{ checked: selected }}
            onPress={() => onChange(segment.value)}
            className={cn(
              'min-h-touch flex-1 flex-row items-center justify-center gap-1.5 rounded-sm px-2',
              selected ? 'border border-primary bg-card' : 'active:bg-card/60',
            )}
          >
            {segment.icon ? (
              <Icon
                name={segment.icon}
                size={18}
                color={selected ? 'foreground' : 'muted-foreground'}
              />
            ) : null}
            <Text
              variant="label"
              tone={selected ? 'default' : 'muted'}
              className={selected ? 'font-sans-black' : undefined}
            >
              {segment.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
