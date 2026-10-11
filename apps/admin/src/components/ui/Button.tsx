import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-primary-foreground border-b-4 border-primary-shadow hover:bg-primary-pressed active:border-b-2 active:translate-y-0.5',
  secondary: 'bg-card text-foreground border border-border hover:bg-muted',
  ghost: 'text-muted-foreground hover:bg-muted hover:text-foreground',
  danger:
    'bg-destructive text-destructive-foreground border-b-4 border-destructive-shadow hover:bg-destructive/90 active:border-b-2 active:translate-y-0.5',
};

type ButtonProps = ComponentProps<'button'> & { variant?: ButtonVariant };

export function buttonClass(variant: ButtonVariant = 'primary', className?: string) {
  return cn(
    'inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-md px-4 font-sans-bold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
    variants[variant],
    className,
  );
}

export function Button({ variant = 'primary', className, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={buttonClass(variant, className)} {...props} />;
}
