import { useTranslation } from 'react-i18next';
import { PillTabs } from '@/components/me/PillTabs';
import { useThemeStore } from '@/features/settings/themeStore';

/** Light / dark / system as a compact pill strip; the whole app switches at once. */
export function AppearancePicker() {
  const { t } = useTranslation();
  const preference = useThemeStore((s) => s.preference);
  const setPreference = useThemeStore((s) => s.setPreference);

  return (
    <PillTabs
      compact
      accessibilityLabel={t('me.settings.appearance')}
      value={preference}
      onChange={setPreference}
      options={[
        { value: 'light', label: t('me.settings.light') },
        { value: 'dark', label: t('me.settings.dark') },
        { value: 'system', label: t('me.settings.system') },
      ]}
    />
  );
}
