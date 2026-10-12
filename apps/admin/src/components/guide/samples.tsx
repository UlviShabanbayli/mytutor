import type { ReactNode } from 'react';
import { buttonClass } from '@/components/ui';
import { cn } from '@/lib/cn';

/** A button as it looks in the panel, but inert: the guide only shows it. */
export function SampleButton({
  variant = 'secondary',
  children,
}: {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  children: ReactNode;
}) {
  return (
    <span aria-hidden className={buttonClass(variant, 'pointer-events-none min-h-8 px-3 text-xs')}>
      {children}
    </span>
  );
}

/** Plain text set like a label in the panel, e.g. a stat card title. */
export function SampleLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn('font-sans-bold text-sm text-foreground', className)}>{children}</span>
  );
}

/** A code chip as standards and ids are shown. */
export function SampleCode({
  children,
  tone = 'primary',
}: {
  children: ReactNode;
  tone?: 'primary' | 'destructive';
}) {
  return (
    <span
      className={cn(
        'rounded-sm px-1.5 py-0.5 font-mono text-xs',
        tone === 'primary'
          ? 'bg-secondary text-secondary-foreground'
          : 'bg-destructive-muted text-destructive',
      )}
    >
      {children}
    </span>
  );
}
