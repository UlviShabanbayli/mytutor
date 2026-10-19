import { TextInput, View } from 'react-native';
import { Text } from '@/components/ui';
import { codeCells, CODE_LENGTH, normalizeCode } from '@/features/me/codes';
import { cn } from '@/lib/cn';

type JoinCodeFieldProps = {
  value: string;
  onChange: (code: string) => void;
  accessibilityLabel: string;
  /** Red boxes when the typed code opens no class. */
  invalid?: boolean;
};

/**
 * Six code boxes in two groups of three (design "R4T 9KB"). One real, transparent text field
 * lies over the boxes, so tapping, typing, pasting and screen readers work as usual.
 */
export function JoinCodeField({
  value,
  onChange,
  accessibilityLabel,
  invalid = false,
}: JoinCodeFieldProps) {
  const cells = codeCells(value);
  const box = (ch: string, i: number) => (
    <View
      key={i}
      className={cn(
        'h-14 w-12 items-center justify-center rounded-[12px] border-2',
        invalid && 'border-err bg-err-bg',
        !invalid && (ch || i === value.length ? 'border-honey bg-raised' : 'border-border bg-surf'),
      )}
    >
      <Text className="font-display-black text-xl">{ch}</Text>
    </View>
  );

  return (
    <View className="self-start">
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        className="flex-row items-center gap-1.5"
      >
        {cells.slice(0, 3).map(box)}
        <View className="mx-1 h-[3px] w-3 rounded-sm bg-border" />
        {cells.slice(3).map((ch, i) => box(ch, i + 3))}
      </View>
      <TextInput
        value={value}
        onChangeText={(text) => onChange(normalizeCode(text))}
        accessibilityLabel={accessibilityLabel}
        autoCapitalize="characters"
        autoCorrect={false}
        autoFocus={value.length < CODE_LENGTH}
        maxLength={CODE_LENGTH + 2}
        caretHidden
        className="absolute inset-0 opacity-0"
      />
    </View>
  );
}
