import { View } from 'react-native';
import { cn } from '@/lib/cn';

type ProgressBarProps = {
  /** 0–1 */
  value: number;
  accessibilityLabel: string;
  tone?: 'primary' | 'accent' | 'success';
  className?: string;
};

const fillClasses = { primary: 'bg-primary', accent: 'bg-accent', success: 'bg-success' };

export function ProgressBar({
  value,
  accessibilityLabel,
  tone = 'primary',
  className,
}: ProgressBarProps) {
  const clamped = Math.min(1, Math.max(0, value));
  const percent = Math.round(clamped * 100);

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: percent }}
      className={cn('h-3 overflow-hidden rounded-full bg-muted', className)}
    >
      {/* Width is data-driven, so it cannot be a static className. */}
      <View
        className={cn('h-full rounded-full', fillClasses[tone])}
        style={{ width: `${percent}%` }}
      />
    </View>
  );
}
