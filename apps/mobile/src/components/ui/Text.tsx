import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { cn } from '@/lib/cn';

type TextVariant = 'title' | 'heading' | 'body' | 'label' | 'caption';
type TextTone = 'default' | 'muted' | 'primary' | 'destructive' | 'inverse';

const variantClasses: Record<TextVariant, string> = {
  title: 'text-3xl font-bold',
  heading: 'text-xl font-semibold',
  body: 'text-base',
  label: 'text-sm font-medium',
  caption: 'text-xs',
};

const toneClasses: Record<TextTone, string> = {
  default: 'text-foreground',
  muted: 'text-muted-foreground',
  primary: 'text-primary',
  destructive: 'text-destructive',
  inverse: 'text-primary-foreground',
};

type TextProps = RNTextProps & {
  variant?: TextVariant;
  tone?: TextTone;
  className?: string;
};

export function Text({ variant = 'body', tone = 'default', className, ...props }: TextProps) {
  const isHeader = variant === 'title' || variant === 'heading';

  return (
    <RNText
      accessibilityRole={isHeader ? 'header' : undefined}
      className={cn(variantClasses[variant], toneClasses[tone], className)}
      {...props}
    />
  );
}
