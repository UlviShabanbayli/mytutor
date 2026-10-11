import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'min-w-0 rounded-lg border border-border bg-card text-card-foreground',
        className,
      )}
      {...props}
    />
  );
}
