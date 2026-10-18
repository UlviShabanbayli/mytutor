import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SegmentedControl, Text } from '@/components/ui';
import { useThemeStore, type ThemePreference } from '@/features/settings/themeStore';

/** System / light / dark; the whole app switches as soon as one is chosen. */
export function AppearancePicker() {
  const { t } = useTranslation();
  const preference = useThemeStore((s) => s.preference);
  const setPreference = useThemeStore((s) => s.setPreference);
  const segments = [
    { value: 'system', label: t('progress.themeSystem'), icon: 'phone' },
    { value: 'light', label: t('progress.themeLight'), icon: 'today' },
    { value: 'dark', label: t('progress.themeDark'), icon: 'moon' },
  ] as const satisfies readonly { value: ThemePreference; label: string; icon: string }[];

  return (
    <View className="gap-2.5 px-4 py-3">
      <Text className="font-sans-bold">{t('progress.appearance')}</Text>
      <SegmentedControl
        segments={segments}
        value={preference}
        onChange={setPreference}
        accessibilityLabel={t('progress.appearance')}
      />
    </View>
  );
}
