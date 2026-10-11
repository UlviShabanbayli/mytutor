import { Check, Minus } from 'lucide-react';
import { cn } from '@/lib/cn';

type StageChipProps = { label: string; ready: boolean };

/** One pipeline stage of a topic (source / knowledge / lesson): done or not yet. */
export function StageChip({ label, ready }: StageChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-sans-medium text-xs',
        ready ? 'bg-success-muted text-success' : 'bg-muted text-muted-foreground',
      )}
    >
      {ready ? <Check className="size-3" aria-hidden /> : <Minus className="size-3" aria-hidden />}
      {label}
    </span>
  );
}
