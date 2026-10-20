import { useRef } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { CodeCell } from '@/components/ui';
import { useCodeCues } from '@/lib/useCodeCues';

type CodeBoxesProps = {
  value: string;
  onChange: (value: string) => void;
  length: number;
  /** Names the whole code for screen readers ("6 rəqəmli SMS kodu"). */
  accessibilityLabel: string;
  /** `digits` for SMS codes (one-time-code autofill), `letters` for a child's link code. */
  kind: 'digits' | 'letters';
  error?: boolean;
  editable?: boolean;
  autoFocus?: boolean;
  /** Put a dash after this many boxes ("K7Q – 42M"). */
  splitAfter?: number;
  /** Keeps only the allowed characters of what was typed or pasted. */
  normalize: (text: string) => string;
};

/**
 * A code typed into one hidden field and shown as separate boxes: the next empty box has the
 * caret, filled boxes are warm, a wrong code turns them all red. Tapping any box focuses it.
 * Characters fade up as they land; a wrong code cross-fades to red (micro.otp A).
 */
export function CodeBoxes({
  value,
  onChange,
  length,
  accessibilityLabel,
  kind,
  error = false,
  editable = true,
  autoFocus = true,
  splitAfter,
  normalize,
}: CodeBoxesProps) {
  const input = useRef<TextInput>(null);
  const boxes = Array.from({ length }, (_, i) => i);
  const focusIndex = Math.min(value.length, length - 1);

  useCodeCues(value, error);

  const box = (i: number) => (
    <CodeCell
      key={i}
      char={value[i] ?? ''}
      active={editable && !error && i === focusIndex && value.length < length}
      error={error}
      className="h-[60px] min-w-0 flex-1"
    />
  );

  return (
    <Pressable accessible={false} onPress={() => input.current?.focus()} className="flex-row">
      <TextInput
        ref={input}
        accessibilityLabel={accessibilityLabel}
        value={value}
        onChangeText={(text) => onChange(normalize(text))}
        maxLength={length}
        editable={editable}
        autoFocus={autoFocus}
        caretHidden
        autoCorrect={false}
        keyboardType={kind === 'digits' ? 'number-pad' : 'default'}
        autoCapitalize={kind === 'digits' ? 'none' : 'characters'}
        textContentType={kind === 'digits' ? 'oneTimeCode' : 'none'}
        autoComplete={kind === 'digits' ? 'sms-otp' : 'off'}
        // Off-screen but focusable, so the keyboard and SMS autofill still reach it.
        className="absolute h-px w-px opacity-0"
      />
      {/* The field itself is what screen readers read; the boxes only draw it. */}
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        className="flex-1 flex-row items-center gap-2"
      >
        {splitAfter === undefined ? (
          boxes.map(box)
        ) : (
          <>
            {boxes.slice(0, splitAfter).map(box)}
            <View className="mx-0.5 h-[3px] w-3 rounded-full bg-border" />
            {boxes.slice(splitAfter).map(box)}
          </>
        )}
      </View>
    </Pressable>
  );
}
