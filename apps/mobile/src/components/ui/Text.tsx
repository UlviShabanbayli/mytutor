import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { cn } from '@/lib/cn';

type TextVariant = 'display' | 'title' | 'heading' | 'subheading' | 'body' | 'label' | 'caption';
type TextTone =
  'default' | 'muted' | 'primary' | 'success' | 'destructive' | 'inverse' | 'secondary';

const variantClasses: Record<TextVariant, string> = {
  display: 'font-sans-black text-4xl',
  title: 'font-sans-black text-3xl',
  heading: 'font-sans-bold text-xl',
  subheading: 'font-sans-bold text-lg',
  body: 'font-sans text-base',
  label: 'font-sans-medium text-sm',
  caption: 'font-sans text-xs',
};

const toneClasses: Record<TextTone, string> = {
  default: 'text-foreground',
  muted: 'text-muted-foreground',
  primary: 'text-primary',
  success: 'text-success',
  destructive: 'text-destructive',
  inverse: 'text-primary-foreground',
  secondary: 'text-secondary-foreground',
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
