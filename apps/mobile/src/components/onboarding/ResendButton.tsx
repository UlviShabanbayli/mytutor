import { Pressable } from 'react-native';
import { Icon, Text } from '@/components/ui';
import { cn } from '@/lib/cn';

type ResendButtonProps = {
  /** Seconds until a new code may be sent; 0 enables the button. */
  secondsLeft: number;
  /** "Yenidən göndər · 0:42" while waiting. */
  waitingLabel: string;
  label: string;
  onPress: () => void;
  busy?: boolean;
  /** `boxed`: the small outlined button of the consent card. */
  variant?: 'text' | 'boxed';
};

/** "Send again", locked with a countdown until the next code is allowed. */
export function ResendButton({
  secondsLeft,
  waitingLabel,
  label,
  onPress,
  busy = false,
  variant = 'text',
}: ResendButtonProps) {
  const waiting = secondsLeft > 0;
  const disabled = waiting || busy;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={waiting ? waitingLabel : label}
      accessibilityState={{ disabled, busy }}
      disabled={disabled}
      onPress={onPress}
      className={cn(
        'min-h-[44px] flex-row items-center justify-center gap-1.5 active:opacity-70',
        variant === 'boxed' ? 'flex-1 rounded-md px-2' : 'px-0.5',
        variant === 'boxed' && (disabled ? 'bg-wax' : 'border-2 border-border bg-surf'),
      )}
    >
      <Icon
        name={variant === 'boxed' ? 'refresh' : 'clock'}
        size={16}
        color={disabled ? 'lock-ink' : 'honey-text'}
      />
      <Text
        className={cn('font-sans-bold text-sm', disabled ? 'text-lock-ink' : 'text-honey-text')}
      >
        {waiting ? waitingLabel : label}
      </Text>
    </Pressable>
  );
}
