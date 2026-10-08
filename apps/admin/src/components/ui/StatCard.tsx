import { cn } from '@/lib/cn';
import { dotTone, type Tone } from './tones';

type StatCardProps = { label: string; value: string | number; detail?: string; tone?: Tone };

export function StatCard({ label, value, detail, tone }: StatCardProps) {
  return (
    <div className="min-w-0 rounded-md border border-border bg-card px-4 py-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {tone ? <span className={cn('size-2 rounded-full', dotTone[tone])} aria-hidden /> : null}
        {label}
      </div>
      <div className="font-sans-black text-2xl tabular-nums text-foreground">{value}</div>
      {detail ? <div className="text-xs text-muted-foreground">{detail}</div> : null}
    </div>
  );
}
