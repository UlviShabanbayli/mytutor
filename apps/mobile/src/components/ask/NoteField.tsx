import { TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { useThemeColors } from '@/theme';

type NoteFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

/** Longest note the teacher reads with the photo. */
export const NOTE_MAX = 200;

/** Optional short note: where the student got stuck. */
export function NoteField({ value, onChange }: NoteFieldProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();

  return (
    <View className="gap-1.5">
      <Text variant="overline" tone="muted" className="text-xs">
        {t('ask.send.note')}
      </Text>
      <TextInput
        accessibilityLabel={t('ask.send.noteA11y')}
        value={value}
        onChangeText={onChange}
        maxLength={NOTE_MAX}
        multiline
        numberOfLines={2}
        placeholder={t('ask.send.notePlaceholder')}
        placeholderTextColor={colors.muted}
        textAlignVertical="top"
        className="min-h-[64px] rounded-md border border-border bg-surf px-3 py-2.5 font-sans text-base text-ink"
      />
      <Text variant="caption" tone="muted" className="self-end font-sans text-xs">
        {t('ask.send.noteCount', { length: value.length, max: NOTE_MAX })}
      </Text>
    </View>
  );
}
