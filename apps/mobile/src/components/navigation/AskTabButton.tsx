import type { BottomTabBarButtonProps } from 'expo-router/js-tabs';
import { Pressable, View } from 'react-native';
import { Icon } from '@/components/ui';
import { cn } from '@/lib/cn';

type AskTabButtonProps = BottomTabBarButtonProps & { label: string };

/** The middle tab: a round cobalt camera button instead of an icon and label. */
export function AskTabButton({ onPress, accessibilityState, label }: AskTabButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={accessibilityState}
      onPress={onPress}
      className="flex-1 items-center justify-center"
    >
      {({ pressed }) => (
        <View
          className={cn(
            'h-14 w-14 items-center justify-center rounded-full',
            pressed ? 'bg-primary-pressed' : 'bg-primary',
          )}
        >
          <Icon name="camera" size={26} color="primary-foreground" />
        </View>
      )}
    </Pressable>
  );
}
