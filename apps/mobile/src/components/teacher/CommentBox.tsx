import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { useThemeColors } from '@/theme';
import { SmallButton } from './SmallButton';
import { SoonSheet } from './SoonSheet';

type CommentBoxProps = { name: string; value: string; onChange: (value: string) => void };

/** The teacher's comment the student will read, with ready-made phrases. */
export function CommentBox({ name, value, onChange }: CommentBoxProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [voice, setVoice] = useState(false);
  const label = t('teacher.grade.comment', { name });
  const append = (phrase: string) => onChange(value.trim() ? `${value.trim()} ${phrase}` : phrase);

  return (
    <View className="gap-1.5">
      <Text variant="label" tone="muted">
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        accessibilityLabel={label}
        multiline
        placeholderTextColor={colors.muted}
        textAlignVertical="top"
        className="min-h-[66px] rounded-md border-2 border-border bg-surf px-3 py-2 font-sans text-sm text-ink"
      />
      <View accessibilityLabel={t('teacher.grade.quick')} className="flex-row flex-wrap gap-1.5">
        <SmallButton
          variant="outline"
          label={t('teacher.grade.quickGreat')}
          onPress={() => append(t('teacher.grade.quickGreat'))}
        />
        <SmallButton
          variant="outline"
          label={t('teacher.grade.quickFormula')}
          onPress={() => append(t('teacher.grade.quickFormula'))}
        />
        <SmallButton
          variant="outline"
          icon="mic"
          label={t('teacher.grade.voice')}
          accessibilityLabel={t('teacher.grade.voiceLabel')}
          onPress={() => setVoice(true)}
        />
      </View>
      <SoonSheet
        content={
          voice ? { title: t('teacher.soon.voiceTitle'), body: t('teacher.soon.voiceBody') } : null
        }
        onClose={() => setVoice(false)}
      />
    </View>
  );
}
