import { Text as RNText, type TextProps as RNTextProps, StyleSheet } from 'react-native';
import { cn } from '@/lib/cn';

type TextVariant = 'display' | 'title' | 'heading' | 'subheading' | 'body' | 'label' | 'caption';
type TextTone =
  'default' | 'muted' | 'primary' | 'success' | 'destructive' | 'inverse' | 'secondary';

const variantClasses: Record<TextVariant, string> = {
  display: 'font-sans-black text-4xl',
  title: 'font-sans-black text-2xl',
  heading: 'font-sans-black text-lg',
  subheading: 'font-sans-black text-base',
  body: 'font-sans text-base',
  label: 'font-sans-bold text-sm',
  caption: 'font-sans-medium text-xs',
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

// Plus Jakarta Sans turns "x" between digits into "×" (contextual alternates): in a maths app
// "2x" must stay a variable. No className sets font features, hence this one style.
const styles = StyleSheet.create({ text: { fontVariant: ['no-contextual'] } });

type TextProps = RNTextProps & {
  variant?: TextVariant;
  tone?: TextTone;
  className?: string;
};

export function Text({
  variant = 'body',
  tone = 'default',
  className,
  style,
  ...props
}: TextProps) {
  const isHeader = variant === 'display' || variant === 'title' || variant === 'heading';

  return (
    <RNText
      accessibilityRole={isHeader ? 'header' : undefined}
      className={cn(variantClasses[variant], toneClasses[tone], className)}
      style={[styles.text, style]}
      {...props}
    />
  );
}
