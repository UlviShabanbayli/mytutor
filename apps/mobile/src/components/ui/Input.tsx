import { useState, type ReactNode, type Ref } from 'react';
import { TextInput, type TextInputProps, View } from 'react-native';
import { cn } from '@/lib/cn';
import { useThemeColors } from '@/theme';
import { Icon } from './Icon';
import { Text } from './Text';

type InputProps = Omit<TextInputProps, 'style'> & {
  label: string;
  hint?: string;
  error?: string;
  /** Fixed text before the value, e.g. "+994" with a divider. */
  prefix?: ReactNode;
  className?: string;
  ref?: Ref<TextInput>;
};

/** 56pt field with a 2pt border that turns honey while focused and red on error. */
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

  return (
    <View className={cn('gap-1.5', className)}>
      <Text variant="label">{label}</Text>
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
      {message ? (
        <View className="flex-row items-center gap-1.5">
          {error ? <Icon name="warning" size={16} color="err" /> : null}
          <Text
            variant="label"
            tone={error ? 'err' : 'muted'}
            accessibilityLiveRegion={error ? 'polite' : 'none'}
            className="flex-1"
          >
            {message}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
