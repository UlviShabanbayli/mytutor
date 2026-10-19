import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useThemeColors } from '@/theme';

export const BIO_MAX = 160;

type BioFieldProps = {
  value: string;
  onChange: (bio: string) => void;
};

/** An optional two-line bio with a character counter. */
export function BioField({ value, onChange }: BioFieldProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [focused, setFocused] = useState(false);
  const label = t('onboarding.teacherStart.bio');

  return (
    <View className="gap-2">
      <View className="flex-row justify-between gap-2">
        <Text variant="overline" tone="muted" className="text-xs">
          {label}
        </Text>
        <Text className="font-sans-bold text-xs" tone="muted">
          {t('onboarding.teacherStart.bioCounter', { count: value.length, max: BIO_MAX })}
        </Text>
      </View>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChange}
        maxLength={BIO_MAX}
        multiline
        placeholder={t('onboarding.teacherStart.bioPlaceholder')}
        placeholderTextColor={colors['lock-ink']}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        textAlignVertical="top"
        className={cn(
          'min-h-[76px] rounded-md border-2 bg-surf px-3 py-2.5 font-sans text-base text-ink',
          focused ? 'border-honey' : 'border-border',
        )}
      />
    </View>
  );
}
