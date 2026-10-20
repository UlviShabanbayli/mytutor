import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { Text, useRaisedPress } from '@/components/ui';
import { cn } from '@/lib/cn';

type KeypadKeyProps = {
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
  /** `number`: the 52pt digit keys in the display face; `math`: 48pt formula keys. */
  kind?: 'number' | 'math';
  className?: string;
};

/** A raised key on a 2pt border-coloured edge; it sinks while pressed. */
export function KeypadKey({
  label,
  accessibilityLabel,
  onPress,
  kind = 'math',
  className,
}: KeypadKeyProps) {
  const press = useRaisedPress({ depth: 2 });
  return (
    <Pressable
      onPressIn={press.pressIn}
      onPressOut={press.pressOut}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      className={cn('flex-1 rounded-md bg-border pb-0.5', className)}
    >
      {({ pressed }) => (
        <Animated.View style={press.faceStyle}>
          <Text
            className={cn(
              'overflow-hidden rounded-md border border-border bg-surf text-center',
              kind === 'number'
                ? 'py-3 font-display-bold text-xl'
                : 'py-2.5 font-sans-bold text-lg',
            )}
          >
            {label}
          </Text>
        </Animated.View>
      )}
    </Pressable>
  );
}
