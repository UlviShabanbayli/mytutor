import { ActivityIndicator, Pressable, type PressableProps, View } from 'react-native';
import { cn } from '@/lib/cn';
import { useThemeColors, type SemanticColors } from '@/theme';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'destructive' | 'neutral' | 'ghost';

/** Fill (and its pressed tone) and content color per variant. */
const variants: Record<
  ButtonVariant,
  { fill: string; pressed: string; text: string; content: keyof SemanticColors }
> = {
  primary: {
    fill: 'bg-primary',
    pressed: 'bg-primary-pressed',
    text: 'text-primary-foreground',
    content: 'primary-foreground',
  },
  secondary: {
    fill: 'border border-border bg-card',
    pressed: 'border border-border bg-muted',
    text: 'text-foreground',
    content: 'foreground',
  },
  success: {
    fill: 'bg-success',
    pressed: 'bg-success-shadow',
    text: 'text-success-foreground',
    content: 'success-foreground',
  },
  destructive: {
    fill: 'bg-destructive',
    pressed: 'bg-destructive-shadow',
    text: 'text-destructive-foreground',
    content: 'destructive-foreground',
  },
  // Dark fill for "move on" after a wrong answer: calm, not alarming.
  neutral: {
    fill: 'bg-foreground',
    pressed: 'bg-foreground/80',
    text: 'text-background',
    content: 'background',
  },
  ghost: {
    fill: 'bg-transparent',
    pressed: 'bg-muted',
    text: 'text-primary',
    content: 'primary',
  },
};

type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  variant?: ButtonVariant;
  /** `lg` (56pt) for a screen's main action, `md` (48pt) for the rest. */
  size?: 'lg' | 'md';
  icon?: IconName;
  loading?: boolean;
  className?: string;
};

/** Flat button; the fill darkens while pressed. */
export function Button({
  label,
  variant = 'primary',
  size = 'lg',
  icon,
  loading = false,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const colors = useThemeColors();
  const v = variants[variant];
  const isDisabled = disabled === true || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      className={className}
      {...props}
    >
      {({ pressed }) => (
        <View
          className={cn(
            'flex-row items-center justify-center gap-2 rounded-md px-5',
            size === 'lg' ? 'min-h-14 py-3' : 'min-h-touch py-2.5',
            pressed && !isDisabled ? v.pressed : v.fill,
            isDisabled && 'opacity-50',
          )}
        >
          {loading ? (
            <ActivityIndicator color={colors[v.content]} />
          ) : (
            icon && <Icon name={icon} size={20} color={v.content} />
          )}
          <Text className={cn('font-sans-black text-base', v.text)}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}
