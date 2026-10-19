import { Pressable, View } from 'react-native';
import { Icon, type IconName, Text } from '@/components/ui';
import { cn } from '@/lib/cn';
import type { ColorName } from '@/theme';

type SmallButtonVariant = 'honey' | 'outline' | 'dashed' | 'info' | 'ghost';

const styles: Record<SmallButtonVariant, { face: string; text: string; icon: ColorName }> = {
  honey: { face: 'bg-honey', text: 'text-on-honey', icon: 'on-honey' },
  outline: { face: 'border-2 border-border bg-transparent', text: 'text-ink', icon: 'ink' },
  dashed: {
    face: 'border-2 border-dashed border-border bg-transparent',
    text: 'text-honey-text',
    icon: 'honey-text',
  },
  info: { face: 'border-2 border-info bg-transparent', text: 'text-info', icon: 'info' },
  ghost: { face: 'bg-transparent', text: 'text-honey-text', icon: 'honey-text' },
};

type SmallButtonProps = {
  label: string;
  onPress: () => void;
  variant?: SmallButtonVariant;
  icon?: IconName;
  /** Spoken name when it differs from the visible label. */
  accessibilityLabel?: string;
  accessibilityHint?: string;
  disabled?: boolean;
  className?: string;
};

/**
 * 44pt compact action inside cards and rows (design "Sinif aç", "Dəvət et", "Söz ver"): the
 * honey one sits on a 3pt honey-deep edge, the others are outlined.
 */
export function SmallButton({
  label,
  onPress,
  variant = 'honey',
  icon,
  accessibilityLabel,
  accessibilityHint,
  disabled = false,
  className,
}: SmallButtonProps) {
  const s = styles[variant];
  const raised = variant === 'honey' && !disabled;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      className={cn('self-start', className)}
    >
      {({ pressed }) => (
        <View className={cn('rounded-md', raised && 'bg-honey-deep pb-[3px]')}>
          <View
            className={cn(
              'h-[44px] flex-row items-center justify-center gap-1.5 rounded-md px-3.5',
              disabled ? 'bg-wax' : s.face,
              raised && pressed && 'translate-y-[3px]',
              !raised && pressed && 'opacity-70',
            )}
          >
            {icon ? <Icon name={icon} size={18} color={disabled ? 'lock-ink' : s.icon} /> : null}
            <Text
              numberOfLines={1}
              className={cn('font-sans-black text-sm', disabled ? 'text-lock-ink' : s.text)}
            >
              {label}
            </Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}
