import { ActivityIndicator, Pressable, type PressableProps, View } from 'react-native';
import { cn } from '@/lib/cn';
import { useThemeColors, type SemanticColors } from '@/theme';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'destructive' | 'ghost';

/** Face color, bottom "edge" color (the 3D depth) and content color per variant. */
const variants: Record<
  ButtonVariant,
  { face: string; edge: string; text: string; content: keyof SemanticColors }
> = {
  primary: {
    face: 'bg-primary',
    edge: 'bg-primary-shadow',
    text: 'text-primary-foreground',
    content: 'primary-foreground',
  },
  secondary: {
    face: 'bg-card border-2 border-border',
    edge: 'bg-border',
    text: 'text-primary',
    content: 'primary',
  },
  success: {
    face: 'bg-success',
    edge: 'bg-success-shadow',
    text: 'text-success-foreground',
    content: 'success-foreground',
  },
  destructive: {
    face: 'bg-destructive',
    edge: 'bg-destructive-shadow',
    text: 'text-destructive-foreground',
    content: 'destructive-foreground',
  },
  ghost: {
    face: 'bg-transparent',
    edge: 'bg-transparent',
    text: 'text-primary',
    content: 'primary',
  },
};

type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  variant?: ButtonVariant;
  icon?: IconName;
  loading?: boolean;
  className?: string;
};

/**
 * Tactile button: the face sits on a darker edge and sinks into it while pressed.
 * Pressing only translates the face, so layout never shifts.
 */
export function Button({
  label,
  variant = 'primary',
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
      className={cn('rounded-lg pb-1', v.edge, isDisabled && 'opacity-50', className)}
      {...props}
    >
      {({ pressed }) => (
        <View
          className={cn(
            'min-h-touch flex-row items-center justify-center gap-2 rounded-lg px-5 py-3',
            v.face,
            pressed && !isDisabled && 'translate-y-1',
          )}
        >
          {loading ? (
            <ActivityIndicator color={colors[v.content]} />
          ) : (
            icon && <Icon name={icon} size={20} color={v.content} />
          )}
          <Text className={cn('font-sans-bold text-base', v.text)}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}
