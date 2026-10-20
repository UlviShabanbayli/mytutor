import { useEffect, useRef, useState, type ReactNode, type Ref } from 'react';
import { TextInput, type TextInputProps, View } from 'react-native';
import { cn } from '@/lib/cn';
import { playCue } from '@/lib/cues';
import { useThemeColors } from '@/theme';
import { FocusRing } from './FocusRing';
import { RiseIn } from './RiseIn';
import { Text } from './Text';
import { WarningMark } from './WarningMark';

type InputProps = Omit<TextInputProps, 'style'> & {
  label: string;
  hint?: string;
  error?: string;
  /** Fixed text before the value, e.g. "+994" with a divider. */
  prefix?: ReactNode;
  className?: string;
  ref?: Ref<TextInput>;
};

/**
 * 56pt field with a 2pt border that turns honey while focused and red on error. Focus pulses
 * a soft ring and warms the label; an error slides in under the field with its warning
 * drawing itself (micro.field B · Halqa).
 */
export function Input({
  label,
  hint,
  error,
  prefix,
  className,
  onFocus,
  onBlur,
  ref,
  ...props
}: InputProps) {
  const colors = useThemeColors();
  const [focused, setFocused] = useState(false);
  const message = error ?? hint;
  const hadError = useRef(error !== undefined);

  // A new error gets a light tap, once; the message itself stays calm.
  useEffect(() => {
    if (error !== undefined && !hadError.current) playCue('wrong');
    hadError.current = error !== undefined;
  }, [error]);

  return (
    <View className={cn('gap-1.5', className)}>
      <Text variant="label" tone={error ? 'err' : focused ? 'honey' : 'default'}>
        {label}
      </Text>
      <View>
        <FocusRing focused={focused} error={error !== undefined} />
        <View
          className={cn(
            'h-14 flex-row items-center gap-2.5 rounded-lg border-2 bg-surf px-3.5',
            error ? 'border-err' : focused ? 'border-honey' : 'border-border',
          )}
        >
          {prefix}
          <TextInput
            ref={ref}
            accessibilityLabel={label}
            accessibilityHint={message}
            placeholderTextColor={colors.muted}
            className="h-full flex-1 font-sans-semibold text-md text-ink"
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            {...props}
          />
        </View>
      </View>
      {message ? (
        // An error slides 8pt down into place; a hint just stands there.
        <RiseIn
          key={error ? `err:${error}` : 'hint'}
          from={error ? -8 : 0}
          className="flex-row items-center gap-1.5"
        >
          {error ? <WarningMark size={16} /> : null}
          <Text
            variant="label"
            tone={error ? 'err' : 'muted'}
            accessibilityLiveRegion={error ? 'polite' : 'none'}
            className="flex-1"
          >
            {message}
          </Text>
        </RiseIn>
      ) : null}
    </View>
  );
}
