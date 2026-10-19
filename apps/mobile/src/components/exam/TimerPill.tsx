import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';
import { clockParts, formatClock } from '@/features/exam/mockTimer';
import { cn } from '@/lib/cn';

type TimerPillProps = {
  remainingMs: number;
  size?: 'md' | 'sm';
};

/** Time left on the inverted pill. Read on focus only, so it never talks over the question. */
export function TimerPill({ remainingMs, size = 'md' }: TimerPillProps) {
  const { t } = useTranslation();
  const { minutes, seconds } = clockParts(remainingMs);

  return (
    <View
      accessible
      accessibilityRole="timer"
      accessibilityLabel={t('exam.run.timerA11y', {
        minutes: t('exam.run.minutesLong', { count: minutes }),
        seconds: t('exam.run.secondsLong', { count: seconds }),
      })}
      className={cn(
        'flex-row items-center gap-1.5 rounded-md bg-spot',
        size === 'md' ? 'h-10 px-3' : 'h-8 px-2.5',
      )}
    >
      <Icon name="clock" size={size === 'md' ? 18 : 16} color="honey" />
      <Text
        className={cn(
          'text-on-spot',
          size === 'md' ? 'font-display-black text-base' : 'font-sans-black text-sm',
        )}
      >
        {formatClock(remainingMs)}
      </Text>
    </View>
  );
}
