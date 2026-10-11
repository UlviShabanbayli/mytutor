import { Monitor, Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SegmentedControl } from '@/components/ui';
import { type ThemePreference, useThemeStore } from '@/features/theme/themeStore';

export function ThemeToggle() {
  const { t } = useTranslation();
  const preference = useThemeStore((s) => s.preference);
  const setPreference = useThemeStore((s) => s.setPreference);
  return (
    <SegmentedControl<ThemePreference>
      label={t('theme.label')}
      value={preference}
      onChange={setPreference}
      iconOnly
      options={[
        { value: 'light', label: t('theme.light'), icon: <Sun className="size-4" /> },
        { value: 'system', label: t('theme.system'), icon: <Monitor className="size-4" /> },
        { value: 'dark', label: t('theme.dark'), icon: <Moon className="size-4" /> },
      ]}
    />
  );
}
