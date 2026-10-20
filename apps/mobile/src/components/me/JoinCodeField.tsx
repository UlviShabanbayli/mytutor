import { TextInput, View } from 'react-native';
import { Text } from '@/components/ui';
import { CLASS_CODE_LENGTH, classCodeCells, normalizeClassCode } from '@/features/me/codes';
import { cn } from '@/lib/cn';

type JoinCodeFieldProps = {
  value: string;
  onChange: (code: string) => void;
  accessibilityLabel: string;
  /** Red boxes when the typed code opens no class. */
  invalid?: boolean;
};

/**
 * Nine code boxes in groups of two, four and three, as teachers share the code ("7B-MATH-4K2").
 * One real, transparent text field lies over the boxes, so tapping, typing, pasting and screen
 * readers work as usual.
 */
export function JoinCodeField({
  value,
  onChange,
  accessibilityLabel,
  invalid = false,
}: JoinCodeFieldProps) {
  let index = 0;
  const box = (ch: string) => {
    const i = index++;
    return (
      <View
        key={i}
        className={cn(
          'h-12 w-[30px] items-center justify-center rounded-[10px] border-2',
          invalid && 'border-err bg-err-bg',
          !invalid &&
            (ch || i === value.length ? 'border-honey bg-raised' : 'border-border bg-surf'),
        )}
      >
        <Text className="font-display-black text-lg">{ch}</Text>
      </View>
    );
  };

  return (
    <View className="self-start">
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        className="flex-row items-center gap-1"
      >
        {classCodeCells(value).map((group, g) => (
          <View key={g} className="flex-row items-center gap-1">
            {g > 0 ? <View className="mx-0.5 h-[3px] w-2 rounded-sm bg-border" /> : null}
            {group.map(box)}
          </View>
        ))}
      </View>
      <TextInput
        value={value}
        onChangeText={(text) => onChange(normalizeClassCode(text))}
        accessibilityLabel={accessibilityLabel}
        autoCapitalize="characters"
        autoCorrect={false}
        autoFocus={value.length < CLASS_CODE_LENGTH}
        maxLength={CLASS_CODE_LENGTH + 2}
        caretHidden
        className="absolute inset-0 opacity-0"
      />
    </View>
  );
}
