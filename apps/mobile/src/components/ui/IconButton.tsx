import { Pressable } from 'react-native';
import { cn } from '@/lib/cn';
import type { SemanticColors } from '@/theme';
import { Icon, type IconName } from './Icon';

type IconButtonProps = {
  icon: IconName;
  accessibilityLabel: string;
  onPress: () => void;
  color?: keyof SemanticColors;
  className?: string;
};

/** Icon-only control with a full 48pt hit area. */
export function IconButton({
  icon,
  accessibilityLabel,
  onPress,
  color = 'muted-foreground',
  className,
}: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      className={cn(
        'min-h-touch min-w-touch items-center justify-center rounded-full active:bg-muted',
        className,
      )}
    >
      <Icon name={icon} size={26} color={color} />
    </Pressable>
  );
}
