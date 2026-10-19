import { Monitor, Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SegmentedControl } from '@/components/ui';
import { type ThemePreference, useThemeStore } from '@/features/theme/themeStore';

type ThemeToggleProps = {
  /** Words instead of icons, filling the width (the sidebar). */ withLabels?: boolean;
};

export function ThemeToggle({ withLabels = false }: ThemeToggleProps) {
  const { t } = useTranslation();
  const preference = useThemeStore((s) => s.preference);
  const setPreference = useThemeStore((s) => s.setPreference);
  return (
    <SegmentedControl<ThemePreference>
      label={t('theme.label')}
      value={preference}
      onChange={setPreference}
      iconOnly={!withLabels}
      stretch={withLabels}
      options={[
        {
          value: 'system',
          label: t('theme.system'),
          icon: withLabels ? null : <Monitor className="size-4" />,
        },
        {
          value: 'light',
          label: t('theme.light'),
          icon: withLabels ? null : <Sun className="size-4" />,
        },
        {
          value: 'dark',
          label: t('theme.dark'),
          icon: withLabels ? null : <Moon className="size-4" />,
        },
      ]}
    />
  );
}
