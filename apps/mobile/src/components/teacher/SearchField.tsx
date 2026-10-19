import { TextInput, View } from 'react-native';
import { Icon } from '@/components/ui';
import { useThemeColors } from '@/theme';

type SearchFieldProps = { value: string; onChangeText: (value: string) => void; label: string };

/** 46pt search box with a magnifier; the label doubles as the placeholder. */
export function SearchField({ value, onChangeText, label }: SearchFieldProps) {
  const colors = useThemeColors();

  return (
    <View className="h-[46px] flex-row items-center gap-2 rounded-md border border-border bg-surf px-3">
      <Icon name="search" size={20} color="muted" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        accessibilityLabel={label}
        placeholder={label}
        placeholderTextColor={colors.muted}
        returnKeyType="search"
        autoCorrect={false}
        className="h-full flex-1 font-sans text-base text-ink"
      />
    </View>
  );
}
