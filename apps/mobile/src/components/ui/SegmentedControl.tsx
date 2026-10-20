import { Pressable, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { playCue } from '@/lib/cues';
import { cn } from '@/lib/cn';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';
import { useSegmentIndicator } from './useSegmentIndicator';

type Segment<T extends string> = { value: T; label: string; icon?: IconName };

type SegmentedControlProps<T extends string> = {
  segments: readonly Segment<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Names the group for screen readers, e.g. "Görünüş". */
  accessibilityLabel: string;
  /** Segments as wide as their words (40pt tall), for a settings row's accessory. */
  compact?: boolean;
  className?: string;
};

/**
 * A small set of mutually exclusive choices shown side by side (a radio group) on a wax track;
 * a honey indicator slides to the chosen one (buttons.segment A).
 */
export function SegmentedControl<T extends string>({
  segments,
  value,
  onChange,
  accessibilityLabel,
  compact = false,
  className,
}: SegmentedControlProps<T>) {
  const { indicatorStyle, onSegmentLayout } = useSegmentIndicator(
    segments.findIndex((s) => s.value === value),
  );

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      className={cn('flex-row gap-1 rounded-md bg-wax p-1', className)}
    >
      <View pointerEvents="none" className="absolute inset-x-0 inset-y-1 flex-row">
        <Animated.View style={indicatorStyle}>
          <View className="flex-1 rounded-sm bg-honey" />
        </Animated.View>
      </View>
      {segments.map((segment, i) => {
        const selected = segment.value === value;
        return (
          <Pressable
            key={segment.value}
            accessibilityRole="radio"
            accessibilityLabel={segment.label}
            accessibilityState={{ checked: selected }}
            onLayout={onSegmentLayout(i)}
            onPress={() => {
              if (selected) return;
              playCue('select');
              onChange(segment.value);
            }}
            // Compact segments are 40pt inside the 4pt track padding; the slop keeps 48pt.
            hitSlop={compact ? 4 : undefined}
            className={cn(
              'flex-row items-center justify-center gap-1.5 rounded-sm',
              compact ? 'h-10 px-2.5' : 'min-h-touch flex-1 px-2',
              !selected && 'active:bg-surf/60',
            )}
          >
            {segment.icon ? (
              <Icon name={segment.icon} size={18} color={selected ? 'on-honey' : 'muted'} />
            ) : null}
            <Text
              variant="label"
              tone={selected ? 'default' : 'muted'}
              className={selected ? 'font-sans-black text-on-honey' : undefined}
            >
              {segment.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
