import { router } from 'expo-router';
import { TextInput, View } from 'react-native';
import { Icon, IconButton } from '@/components/ui';
import { useLearnText } from '@/features/learn/useLearnText';
import { useThemeColors } from '@/theme';

type SearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

/** Back, then the search field with a clear button (focused on open). */
export function SearchField({ value, onChange, onSubmit }: SearchFieldProps) {
  const { t } = useLearnText();
  const colors = useThemeColors();

  return (
    <View className="flex-row items-center gap-1 pb-2 pl-1 pr-4">
      <IconButton icon="back" accessibilityLabel={t('common.back')} onPress={router.back} />
      <View className="h-[50px] min-w-0 flex-1 flex-row items-center gap-2 rounded-lg border-2 border-honey bg-surf pl-3">
        <Icon name="search" size={20} color="muted" />
        <TextInput
          autoFocus
          value={value}
          onChangeText={onChange}
          onSubmitEditing={onSubmit}
          returnKeyType="search"
          accessibilityLabel={t('learn.search.field')}
          placeholder={t('learn.search.field')}
          placeholderTextColor={colors.muted}
          className="h-full min-w-0 flex-1 font-sans-semibold text-base text-ink"
        />
        {value ? (
          <IconButton
            icon="x"
            color="muted"
            accessibilityLabel={t('learn.search.clear')}
            onPress={() => onChange('')}
          />
        ) : null}
      </View>
    </View>
  );
}
