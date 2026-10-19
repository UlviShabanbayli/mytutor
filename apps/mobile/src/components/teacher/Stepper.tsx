import { Pressable, View } from 'react-native';
import { Icon, Text } from '@/components/ui';
import { cn } from '@/lib/cn';

type StepperProps = {
  value: string;
  /** Spoken name of the whole control with its value, e.g. "Cəhd sayı: 2". */
  accessibilityLabel: string;
  lessLabel: string;
  moreLabel: string;
  onLess: () => void;
  onMore: () => void;
  canLess: boolean;
  canMore: boolean;
  /** `strong` is the honey-bordered grade stepper; `plain` the form one. */
  tone?: 'plain' | 'strong';
  suffix?: string;
  className?: string;
};

/** − value + in a 50pt box; each button is a full 44pt target. */
export function Stepper({
  value,
  accessibilityLabel,
  lessLabel,
  moreLabel,
  onLess,
  onMore,
  canLess,
  canMore,
  tone = 'plain',
  suffix,
  className,
}: StepperProps) {
  return (
    <View
      accessible={false}
      accessibilityLabel={accessibilityLabel}
      className={cn(
        'h-[50px] flex-row items-center justify-between gap-1 rounded-md border-2 px-0.5',
        tone === 'strong' ? 'border-honey bg-raised' : 'border-border bg-surf',
        className,
      )}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={lessLabel}
        accessibilityState={{ disabled: !canLess }}
        disabled={!canLess}
        onPress={onLess}
        className="h-[44px] w-[44px] items-center justify-center rounded-sm active:bg-wax"
      >
        <Text className={cn('font-sans-bold text-2xl', canLess ? 'text-ink' : 'text-lock-ink')}>
          −
        </Text>
      </Pressable>
      <Text
        accessibilityLiveRegion="polite"
        className={cn(
          'min-w-[52px] text-center',
          tone === 'strong' ? 'font-display-black text-lg' : 'font-sans-black text-base',
        )}
      >
        {value}
        {suffix ? <Text className="font-sans-bold text-sm text-muted">{suffix}</Text> : null}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={moreLabel}
        accessibilityState={{ disabled: !canMore }}
        disabled={!canMore}
        onPress={onMore}
        className="h-[44px] w-[44px] items-center justify-center rounded-sm active:bg-wax"
      >
        <Icon name="plus" size={20} color={canMore ? 'ink' : 'lock-ink'} />
      </Pressable>
    </View>
  );
}
