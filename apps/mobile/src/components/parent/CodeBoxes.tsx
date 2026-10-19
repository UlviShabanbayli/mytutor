import { useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { Text } from '@/components/ui';
import { cn } from '@/lib/cn';

type CodeBoxesProps = {
  value: string;
  onChange: (value: string) => void;
  /** Spoken name of the field, e.g. "Uşağın kodu, 6 simvol". */
  label: string;
  hint?: string;
  /** `code`: letters and digits; `digits`: an SMS code. */
  kind?: 'code' | 'digits';
  error?: boolean;
  length?: number;
};

const clean = (text: string, kind: 'code' | 'digits', length: number) =>
  (kind === 'digits'
    ? text.replace(/\D/g, '')
    : text.toUpperCase().replace(/[^A-Z0-9]/g, '')
  ).slice(0, length);

/**
 * A one-time code as boxes in two groups of three (design "K7Q – 42M"). One real, invisible
 * text field takes the input, so paste and SMS autofill work; the boxes only draw it.
 */
export function CodeBoxes({
  value,
  onChange,
  label,
  hint,
  kind = 'code',
  error = false,
  length = 6,
}: CodeBoxesProps) {
  const input = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  const active = Math.min(value.length, length - 1);
  const half = Math.ceil(length / 2);
  const big = kind === 'code';

  const box = (i: number) => {
    const current = focused && i === active && !error;
    return (
      <View key={i} className={cn('rounded-md', current && 'bg-honey-deep pb-[3px]')}>
        <View
          className={cn(
            'items-center justify-center rounded-md border-2',
            big ? 'h-[60px] w-[46px]' : 'h-[54px] w-[44px]',
            error
              ? 'border-err bg-err-bg'
              : current
                ? 'border-honey bg-raised'
                : 'border-border bg-surf',
          )}
        >
          <Text
            className={cn(
              'font-display-black',
              big ? 'text-2xl' : 'text-xl',
              error ? 'text-err' : 'text-ink',
            )}
          >
            {value[i] ?? ''}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Pressable
      accessible={false}
      onPress={() => input.current?.focus()}
      className="items-center justify-center"
    >
      <View
        className="flex-row items-center justify-center gap-2"
        importantForAccessibility="no-hide-descendants"
      >
        {Array.from({ length: half }, (_, i) => box(i))}
        <View className={cn('h-[3px] rounded-full bg-border', big ? 'w-3.5' : 'w-2.5 opacity-0')} />
        {Array.from({ length: length - half }, (_, i) => box(half + i))}
      </View>
      <TextInput
        ref={input}
        value={value}
        onChangeText={(text) => onChange(clean(text, kind, length))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        accessibilityLabel={label}
        accessibilityHint={hint}
        maxLength={length}
        autoCapitalize={kind === 'code' ? 'characters' : 'none'}
        autoCorrect={false}
        autoComplete={kind === 'digits' ? 'sms-otp' : 'one-time-code'}
        textContentType="oneTimeCode"
        keyboardType={kind === 'digits' ? 'number-pad' : 'default'}
        caretHidden
        // Invisible but on top of the boxes, so a tap anywhere focuses it.
        className="absolute inset-0 text-transparent opacity-0"
      />
    </Pressable>
  );
}
