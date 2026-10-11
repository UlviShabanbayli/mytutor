import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { badgeTone, type Tone } from './tones';

type BadgeProps = {
  tone?: Tone;
  icon?: ReactNode;
  title?: string;
  className?: string;
  children: ReactNode;
};

export function Badge({ tone = 'neutral', icon, title, className, children }: BadgeProps) {
  return (
    <span
      title={title}
      className={cn(
        'inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 font-sans-bold text-xs',
        badgeTone[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
