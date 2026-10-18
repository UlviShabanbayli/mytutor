import { useState } from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ROLES } from '@mytutor/schemas';
import type { Role } from '@mytutor/types';
import { useAppStore } from '@/features/app/appStore';
import { ROLE_HOME } from '@/features/app/roleHome';
import { THEME_PREFERENCES, useThemeStore } from '@/features/settings/themeStore';
import { APP_LOCALES } from '@/i18n';
import { ChoiceSheet } from './ChoiceSheet';
import { SettingTile } from './SettingTile';

type OpenSheet = 'language' | 'appearance' | 'role' | null;

/** Language, appearance and role: the parent's own app settings (never the child's). */
export function SettingsTiles() {
  const { t } = useTranslation();
  const [open, setOpen] = useState<OpenSheet>(null);
  const locale = useAppStore((s) => s.locale);
  const setLocale = useAppStore((s) => s.setLocale);
  const setRole = useAppStore((s) => s.setRole);
  const theme = useThemeStore((s) => s.preference);
  const setTheme = useThemeStore((s) => s.setPreference);
  const close = () => setOpen(null);

  const switchRole = (role: Role) => {
    close();
    if (role === 'parent') return;
    setRole(role);
    router.replace(ROLE_HOME[role]);
  };

  return (
    <View className="gap-2">
      <View className="flex-row gap-2">
        <SettingTile
          icon="globe"
          title={t('parent.me.language')}
          value={t(`parent.me.languageNames.${locale}`)}
          onPress={() => setOpen('language')}
        />
        <SettingTile
          icon="moon"
          title={t('parent.me.appearance')}
          value={t(`parent.me.themes.${theme}`)}
          onPress={() => setOpen('appearance')}
        />
      </View>
      <SettingTile
        icon="rotate"
        title={t('parent.me.role')}
        value={t('parent.me.roleNote')}
        onPress={() => setOpen('role')}
      />
      <ChoiceSheet
        visible={open === 'language'}
        title={t('parent.me.language')}
        choices={APP_LOCALES.map((value) => ({
          value,
          label: t(`parent.me.languageNames.${value}`),
        }))}
        value={locale}
        onChoose={(value) => {
          setLocale(value);
          close();
        }}
        onClose={close}
      />
      <ChoiceSheet
        visible={open === 'appearance'}
        title={t('parent.me.appearance')}
        choices={THEME_PREFERENCES.map((value) => ({
          value,
          label: t(`parent.me.themes.${value}`),
        }))}
        value={theme}
        onChoose={(value) => {
          setTheme(value);
          close();
        }}
        onClose={close}
      />
      <ChoiceSheet
        visible={open === 'role'}
        title={t('parent.me.role')}
        body={t('parent.me.roleBody')}
        choices={ROLES.map((value) => ({ value, label: t(`parent.me.roles.${value}`) }))}
        value="parent"
        onChoose={switchRole}
        onClose={close}
      />
    </View>
  );
}
