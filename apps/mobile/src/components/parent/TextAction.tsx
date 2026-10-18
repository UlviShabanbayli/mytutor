import { Pressable } from 'react-native';
import { Icon, type IconName, Text } from '@/components/ui';
import { cn } from '@/lib/cn';

const tones = {
  honey: { text: 'text-honey-text', icon: 'honey-text' },
  muted: { text: 'text-muted', icon: 'muted' },
  err: { text: 'text-err', icon: 'err' },
  lock: { text: 'text-lock-ink', icon: 'lock-ink' },
} as const;

type TextActionProps = {
  label: string;
  onPress: () => void;
  tone?: keyof typeof tones;
  /** Shown after the label (a chevron for "go on" links). */
  icon?: IconName;
  disabled?: boolean;
  /** A wider spoken name when the label alone is too short. */
  accessibilityLabel?: string;
  className?: string;
};

/** A borderless text button with a full 44pt hit area. */
export function TextAction({
  label,
  onPress,
  tone = 'honey',
  icon,
  disabled = false,
  accessibilityLabel,
  className,
}: TextActionProps) {
  const s = tones[disabled ? 'lock' : tone];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      className={cn(
        'min-h-[44px] flex-row items-center justify-center gap-1.5 px-1 active:opacity-70',
        className,
      )}
    >
      <Text className={cn('font-sans-black text-sm', s.text)}>{label}</Text>
      {icon ? <Icon name={icon} size={16} color={s.icon} /> : null}
    </Pressable>
  );
}
