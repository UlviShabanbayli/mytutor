import { Children } from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import i18n from '@/i18n';
import { cn } from '@/lib/cn';
import { upperCase } from '@/lib/letterCase';

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
  // 11pt CAPS label with 0.08em tracking (upper-cased below, by the language's rules).
  overline: 'font-sans-black text-2xs tracking-[0.9px]',
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

const UPPERCASE = /(^|\s)uppercase(?=\s|$)/g;

type TextProps = RNTextProps & {
  variant?: TextVariant;
  tone?: TextTone;
  className?: string;
};

/**
 * Text in the design's type scale. CAPS (the `overline` variant or an `uppercase` class) are
 * produced here instead of by `textTransform`, which writes Azerbaijani "i" as "I" instead of
 * "İ"; text from nested elements keeps its own case.
 */
export function Text({
  variant = 'body',
  tone = 'default',
  className,
  children,
  ...props
}: TextProps) {
  const isHeader = variant === 'display' || variant === 'title' || variant === 'heading';
  const caps = variant === 'overline' || (className?.match(UPPERCASE) ?? []).length > 0;
  const content = caps
    ? Children.map(children, (child) =>
        typeof child === 'string' ? upperCase(child, i18n.language) : child,
      )
    : children;

  return (
    <RNText
      accessibilityRole={isHeader ? 'header' : undefined}
      className={cn(
        variantClasses[variant],
        toneClasses[tone],
        caps ? className?.replace(UPPERCASE, ' ') : className,
      )}
      {...props}
    >
      {content}
    </RNText>
  );
}
