import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { DEMO_ACCOUNTS, DEMO_SMS_CODE } from '@mytutor/demo-data';
import type { DemoPersona, Role } from '@mytutor/types';
import { Icon, type IconName, SegmentedControl, Text } from '@/components/ui';
import { formatPhone } from '@/features/me/format';
import { showToast } from '@/features/transitions/toastStore';
import { resetDemo } from '@/lib/demoEvents';
import { useDemoPersona, useDemoPersonaStore } from '@/lib/demoPersona';
import { ConfirmSheet } from './ConfirmSheet';
import { SettingsGroup } from './SettingsGroup';
import { SettingsRow } from './SettingsRow';

const ROLE_ICON: Record<Role, IconName> = { student: 'me', teacher: 'book', parent: 'users' };

/**
 * Ayarlar → "Demo": whose world the app shows (Nərmin's, or a first-day student's), a reset of
 * what was done in it on this device, and the test accounts to sign in with (read only).
 */
export function DemoSettingsGroup() {
  const { t } = useTranslation();
  const persona = useDemoPersona();
  const setPersona = useDemoPersonaStore((s) => s.setPersona);
  const [confirm, setConfirm] = useState(false);

  return (
    <SettingsGroup title={t('me.settings.demoGroup')} className="pb-2.5">
      <SettingsRow
        icon="me"
        label={t('me.settings.demoPersona')}
        accessory={
          <SegmentedControl<DemoPersona>
            compact
            accessibilityLabel={t('me.settings.demoPersona')}
            value={persona}
            onChange={(next) => {
              if (next === persona) return;
              setPersona(next);
              showToast(t('me.settings.demoPersonaDone'));
            }}
            segments={[
              { value: 'nermin', label: t('me.settings.personaNermin') },
              { value: 'fresh', label: t('me.settings.personaFresh') },
            ]}
          />
        }
      />
      <SettingsRow
        divider
        icon="refresh"
        label={t('me.settings.demoReset')}
        onPress={() => setConfirm(true)}
      />
      <View className="gap-2 border-t border-border pt-2.5">
        <View className="gap-0.5">
          <Text accessibilityRole="header" className="font-sans-bold">
            {t('me.settings.demoAccounts')}
          </Text>
          <Text tone="muted" className="text-sm">
            {t('me.settings.demoAccountsHint', { code: DEMO_SMS_CODE })}
          </Text>
        </View>
        {DEMO_ACCOUNTS.map((a) => (
          <View
            key={a.phone}
            accessible
            accessibilityLabel={`${a.label}, ${t(`me.settings.roles.${a.role}`)}, ${formatPhone(a.phone)}`}
            className="min-h-11 flex-row items-center gap-2.5"
          >
            <Icon name={ROLE_ICON[a.role]} size={18} color="muted" />
            <View className="min-w-0 flex-1">
              <Text className="font-sans-semibold text-sm" numberOfLines={1}>
                {a.label}
              </Text>
              <Text tone="muted" className="text-xs">
                {t(`me.settings.roles.${a.role}`)}
              </Text>
            </View>
            <Text selectable className="font-sans-bold text-sm">
              {formatPhone(a.phone)}
            </Text>
          </View>
        ))}
      </View>
      <ConfirmSheet
        visible={confirm}
        title={t('me.settings.demoResetTitle')}
        body={t('me.settings.demoResetBody')}
        confirmLabel={t('me.settings.demoResetConfirm')}
        danger
        onClose={() => setConfirm(false)}
        onConfirm={() => {
          resetDemo();
          showToast(t('me.settings.demoResetDone'));
        }}
      />
    </SettingsGroup>
  );
}
