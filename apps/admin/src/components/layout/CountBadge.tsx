import { cn } from '@/lib/cn';

type CountBadgeProps = { value: number; tone?: 'neutral' | 'destructive' };

/** A count at the end of a menu row; nothing at zero. */
export function CountBadge({ value, tone = 'neutral' }: CountBadgeProps) {
  if (!value) return null;
  return (
    <span
      className={cn(
        'rounded-full px-2 py-0.5 text-xs tabular-nums',
        tone === 'destructive'
          ? 'bg-destructive-muted font-sans-black text-destructive'
          : 'font-sans-bold text-muted-foreground',
      )}
    >
      {value}
    </span>
  );
}
