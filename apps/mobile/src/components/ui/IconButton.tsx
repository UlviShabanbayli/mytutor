import { Pressable } from 'react-native';
import { cn } from '@/lib/cn';
import type { ColorName } from '@/theme';
import { Icon, type IconName } from './Icon';

type IconButtonProps = {
  icon: IconName;
  accessibilityLabel: string;
  onPress: () => void;
  color?: ColorName;
  /** `outlined`: a white rounded square with a hairline border (headers on the grey page). */
  variant?: 'plain' | 'outlined';
  className?: string;
};

/** Icon-only control with a full 48pt hit area. */
export function IconButton({
  icon,
  accessibilityLabel,
  onPress,
  color = 'ink',
  variant = 'plain',
  className,
}: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      className={cn(
        'min-h-touch min-w-touch items-center justify-center rounded-md active:bg-wax',
        variant === 'outlined' && 'border border-border bg-surf',
        className,
      )}
    >
      <Icon name={icon} size={24} color={color} />
    </Pressable>
  );
}
