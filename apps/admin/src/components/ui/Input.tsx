import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

export const inputClass = (className?: string) =>
  cn(
    'min-h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60',
    className,
  );

type InputProps = ComponentProps<'input'>;

export function Input({ className, ...props }: InputProps) {
  return <input className={inputClass(className)} {...props} />;
}

type TextareaProps = ComponentProps<'textarea'>;

export function Textarea({ className, ...props }: TextareaProps) {
  return <textarea className={inputClass(cn('py-2 leading-relaxed', className))} {...props} />;
}
