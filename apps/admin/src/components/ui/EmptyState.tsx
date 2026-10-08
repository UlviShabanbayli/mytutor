import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  body?: string;
  className?: string;
  children?: ReactNode;
};

export function EmptyState({ icon, title, body, className, children }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-3 rounded-lg border border-dashed border-border px-6 py-12 text-center',
        className,
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
        {icon}
      </div>
      <h2 className="font-sans-bold text-lg text-foreground">{title}</h2>
      {body ? <p className="max-w-xl text-sm text-muted-foreground">{body}</p> : null}
      {children}
    </div>
  );
}
