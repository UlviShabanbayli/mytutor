import type { BottomTabBarButtonProps } from 'expo-router/js-tabs';
import { Pressable, View } from 'react-native';
import { Icon } from '@/components/ui';
import { cn } from '@/lib/cn';

type AskTabButtonProps = BottomTabBarButtonProps & { label: string };

/**
 * The middle tab: a round cobalt camera button instead of an icon and label. It keeps the role,
 * selected state and handlers the tab bar passes, so screen readers hear it as the other tabs.
 */
export function AskTabButton({
  onPress,
  onLongPress,
  testID,
  role,
  'aria-selected': selected,
  'aria-label': ariaLabel,
  label,
}: AskTabButtonProps) {
  return (
    <Pressable
      role={role}
      aria-label={ariaLabel ?? label}
      aria-selected={selected}
      onPress={onPress}
      onLongPress={onLongPress}
      testID={testID}
      className="flex-1 items-center justify-center"
    >
      {({ pressed }) => (
        <View
          className={cn(
            'h-14 w-14 items-center justify-center rounded-full',
            pressed ? 'bg-honey-deep' : 'bg-honey',
          )}
        >
          <Icon name="camera" size={26} color="on-honey" />
        </View>
      )}
    </Pressable>
  );
}
