import { ActivityIndicator, Pressable, type PressableProps } from 'react-native';
import { cn } from '@/lib/cn';
import { useThemeColors, type SemanticColors } from '@/theme';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type ButtonSize = 'md' | 'lg';

const containerClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary active:bg-primary-pressed',
  secondary: 'bg-secondary active:opacity-80',
  ghost: 'bg-transparent active:bg-muted',
  destructive: 'bg-destructive active:opacity-80',
};

const sizeClasses: Record<ButtonSize, string> = {
  md: 'min-h-touch px-4',
  lg: 'min-h-14 px-6',
};

const contentColor: Record<ButtonVariant, keyof SemanticColors> = {
  primary: 'primary-foreground',
  secondary: 'secondary-foreground',
  ghost: 'primary',
  destructive: 'destructive-foreground',
};

const textClasses: Record<ButtonVariant, string> = {
  primary: 'text-primary-foreground',
  secondary: 'text-secondary-foreground',
  ghost: 'text-primary',
  destructive: 'text-destructive-foreground',
};

type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
};

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  fullWidth = false,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const colors = useThemeColors();
  const isDisabled = disabled === true || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      className={cn(
        'flex-row items-center justify-center gap-2 rounded-md',
        containerClasses[variant],
        sizeClasses[size],
        fullWidth && 'self-stretch',
        isDisabled && 'opacity-50',
        className,
      )}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={colors[contentColor[variant]]} />
      ) : (
        icon && <Icon name={icon} size={20} color={contentColor[variant]} />
      )}
      <Text variant="body" className={cn('font-semibold', textClasses[variant])}>
        {label}
      </Text>
    </Pressable>
  );
}
