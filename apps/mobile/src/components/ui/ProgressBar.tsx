import { View } from 'react-native';
import { cn } from '@/lib/cn';

type ProgressBarProps = {
  /** 0–1 */
  value: number;
  accessibilityLabel: string;
  tone?: 'honey' | 'ok' | 'info';
  className?: string;
};

const fillClasses = { honey: 'bg-honey', ok: 'bg-ok', info: 'bg-info' };

/** 8pt bar: honey on wax. */
export function ProgressBar({
  value,
  accessibilityLabel,
  tone = 'honey',
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
      className={cn('h-2 overflow-hidden rounded-full bg-wax', className)}
    >
      {/* Width is data-driven, so it cannot be a static className. */}
      <View
        className={cn('h-full rounded-full', fillClasses[tone])}
        style={{ width: `${percent}%` }}
      />
    </View>
  );
}
