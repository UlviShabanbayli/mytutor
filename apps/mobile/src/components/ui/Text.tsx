import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { cn } from '@/lib/cn';

type TextVariant =
  'display' | 'title' | 'heading' | 'subheading' | 'body' | 'label' | 'caption' | 'overline';
type TextTone = 'default' | 'muted' | 'honey' | 'ok' | 'err' | 'info' | 'inverse' | 'lock';

// Unbounded for titles and big numbers, Onest for everything else (design type scale).
const variantClasses: Record<TextVariant, string> = {
  display: 'font-display-black text-4xl',
  title: 'font-display-black text-3xl',
  heading: 'font-display-bold text-lg',
  subheading: 'font-sans-black text-md',
  body: 'font-sans text-base',
  label: 'font-sans-bold text-sm',
  caption: 'font-sans-semibold text-sm',
  // 11pt CAPS label with 0.08em tracking.
  overline: 'font-sans-black text-2xs uppercase tracking-[0.9px]',
};

const toneClasses: Record<TextTone, string> = {
  default: 'text-ink',
  muted: 'text-muted',
  honey: 'text-honey-text',
  ok: 'text-ok',
  err: 'text-err',
  info: 'text-info',
  inverse: 'text-on-spot',
  lock: 'text-lock-ink',
};

type TextProps = RNTextProps & {
  variant?: TextVariant;
  tone?: TextTone;
  className?: string;
};

export function Text({ variant = 'body', tone = 'default', className, ...props }: TextProps) {
  const isHeader = variant === 'display' || variant === 'title' || variant === 'heading';

  return (
    <RNText
      accessibilityRole={isHeader ? 'header' : undefined}
      className={cn(variantClasses[variant], toneClasses[tone], className)}
      {...props}
    />
  );
}
