import { useTranslation } from 'react-i18next';
import { SegmentedControl } from '@/components/ui';
import { useThemeStore } from '@/features/settings/themeStore';

/**
 * Light / dark / system as a compact segmented control with the sliding honey indicator
 * (buttons.segment A); the whole app switches at once.
 */
export function AppearancePicker() {
  const { t } = useTranslation();
  const preference = useThemeStore((s) => s.preference);
  const setPreference = useThemeStore((s) => s.setPreference);

  return (
    <SegmentedControl
      compact
      accessibilityLabel={t('me.settings.appearance')}
      value={preference}
      onChange={setPreference}
      segments={[
        { value: 'light', label: t('me.settings.light') },
        { value: 'dark', label: t('me.settings.dark') },
        { value: 'system', label: t('me.settings.system') },
      ]}
    />
  );
}
