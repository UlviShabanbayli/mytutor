import { useState, type Ref } from 'react';
import { TextInput, type TextInputProps, View } from 'react-native';
import { cn } from '@/lib/cn';
import { useThemeColors } from '@/theme';
import { Text } from './Text';

type InputProps = Omit<TextInputProps, 'style'> & {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  ref?: Ref<TextInput>;
};

export function Input({
  label,
  hint,
  error,
  className,
  onFocus,
  onBlur,
  ref,
  ...props
}: InputProps) {
  const colors = useThemeColors();
  const [focused, setFocused] = useState(false);
  const message = error ?? hint;

  return (
    <View className={cn('gap-1.5', className)}>
      <Text variant="label">{label}</Text>
      <TextInput
        ref={ref}
        accessibilityLabel={label}
        accessibilityHint={message}
        placeholderTextColor={colors['muted-foreground']}
        className={cn(
          'min-h-touch rounded-md border bg-card px-4 text-base text-foreground',
          error ? 'border-destructive' : focused ? 'border-ring border-2' : 'border-input',
        )}
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
      {message ? (
        <Text
          variant="caption"
          tone={error ? 'destructive' : 'muted'}
          accessibilityLiveRegion={error ? 'polite' : 'none'}
        >
          {message}
        </Text>
      ) : null}
    </View>
  );
}
