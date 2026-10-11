import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Option<T extends string> = { value: T; label: string; icon?: ReactNode; count?: number };

type SegmentedControlProps<T extends string> = {
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  iconOnly?: boolean;
};

export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
  iconOnly = false,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="inline-flex max-w-full flex-wrap gap-1 rounded-md bg-muted p-1"
    >
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={iconOnly ? o.label : undefined}
            title={iconOnly ? o.label : undefined}
            onClick={() => onChange(o.value)}
            className={cn(
              'inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-sm px-2.5 font-sans-medium text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              selected
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {o.icon}
            {iconOnly ? null : o.label}
            {o.count === undefined ? null : (
              <span className="tabular-nums text-muted-foreground">{o.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
