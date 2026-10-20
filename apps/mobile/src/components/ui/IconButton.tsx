import { Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { cn } from '@/lib/cn';
import type { ColorName } from '@/theme';
import { Icon, type IconName } from './Icon';
import { useWaxPress } from './useWaxPress';

type IconButtonProps = {
  icon: IconName;
  accessibilityLabel: string;
  onPress: () => void;
  color?: ColorName;
  /** `outlined`: a white rounded square with a hairline border (headers on the grey page). */
  variant?: 'plain' | 'outlined';
  className?: string;
};

/** Icon-only control with a full 48pt hit area; pressed, a wax square grows behind the icon. */
export function IconButton({
  icon,
  accessibilityLabel,
  onPress,
  color = 'ink',
  variant = 'plain',
  className,
}: IconButtonProps) {
  const wax = useWaxPress();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      onPressIn={wax.pressIn}
      onPressOut={wax.pressOut}
      className={cn(
        'min-h-touch min-w-touch items-center justify-center rounded-md',
        variant === 'outlined' && 'border border-border bg-surf',
        className,
      )}
    >
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, wax.waxStyle]}>
        <View className="flex-1 rounded-md bg-wax" />
      </Animated.View>
      <Icon name={icon} size={24} color={color} />
    </Pressable>
  );
}
