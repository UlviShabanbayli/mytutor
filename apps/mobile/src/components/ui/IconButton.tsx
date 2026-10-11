import { Pressable } from 'react-native';
import { cn } from '@/lib/cn';
import type { SemanticColors } from '@/theme';
import { Icon, type IconName } from './Icon';

type IconButtonProps = {
  icon: IconName;
  accessibilityLabel: string;
  onPress: () => void;
  color?: keyof SemanticColors;
  /** `outlined`: a round white button with a hairline border (headers on a grey ground). */
  variant?: 'plain' | 'outlined';
  className?: string;
};

/** Icon-only control with a full 48pt hit area. */
export function IconButton({
  icon,
  accessibilityLabel,
  onPress,
  color = 'foreground',
  variant = 'plain',
  className,
}: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      className={cn(
        'min-h-touch min-w-touch items-center justify-center rounded-full active:bg-muted',
        variant === 'outlined' && 'border border-border bg-card',
        className,
      )}
    >
      <Icon name={icon} size={24} color={color} />
    </Pressable>
  );
}
