import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppearancePicker } from '@/components/progress/AppearancePicker';
import { Button, Screen, ScreenHeader } from '@/components/ui';
import { useAppStore } from '@/features/app/appStore';
import { QUIET_HOURS, type QuietHours, useSettingsStore } from '@/features/me/settingsStore';
import { useMeStore } from '@/features/me/store';
import type { AppLocale } from '@/i18n';
import { ChoiceSheet } from './ChoiceSheet';
import { ConfirmSheet } from './ConfirmSheet';
import { NicknameSheet } from './NicknameSheet';
import { NotificationChips } from './NotificationChips';
import { PillTabs } from './PillTabs';
import { SettingsGroup } from './SettingsGroup';
import { SettingsRow } from './SettingsRow';
import { SwitchRow } from './SwitchRow';

type SheetKind = 'language' | 'quiet' | 'nickname' | 'signOut' | 'delete';
const GOALS = ['10', '20', '30'] as const;
const GOAL_MINUTES = { '10': 10, '20': 20, '30': 30 } as const;

/** "Ayarlar": language, look, sound and motion, daily goal, notifications, account, about. */
export function SettingsView() {
  const { t } = useTranslation();
  const [sheet, setSheet] = useState<SheetKind | null>(null);
  const locale = useAppStore((s) => s.locale);
  const setLocale = useAppStore((s) => s.setLocale);
  const minutes = useAppStore((s) => s.profile.dailyMinutes);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const resetOnboarding = useAppStore((s) => s.resetOnboarding);
  const settings = useSettingsStore();
  const guest = useMeStore((s) => s.guest);
  const nickname = useMeStore((s) => s.nickname);
  const goal = GOALS.find((g) => GOAL_MINUTES[g] === minutes) ?? '20';
  const close = () => setSheet(null);
  const leave = () => {
    resetOnboarding();
    router.replace('/onboarding');
  };
  const quietLabel = (v: QuietHours) => (v === 'off' ? t('me.settings.quietOff') : v);

  return (
    <Screen className="gap-1.5">
      <ScreenHeader title={t('me.settings.title')} />
      <SettingsGroup title={t('me.settings.langGroup')}>
        <SettingsRow
          icon="globe"
          label={t('me.settings.language')}
          value={t(`me.settings.languageNames.${locale}`)}
          onPress={() => setSheet('language')}
        />
        <SettingsRow
          divider
          icon="moon"
          label={t('me.settings.appearance')}
          accessory={<AppearancePicker />}
        />
      </SettingsGroup>
      <SettingsGroup title={t('me.settings.feelGroup')}>
        <SwitchRow
          title={t('me.settings.sound')}
          sub={t('me.settings.soundSub')}
          value={settings.sound}
          onChange={(on) => settings.setFeel('sound', on)}
        />
        <SwitchRow
          divider
          title={t('me.settings.haptics')}
          value={settings.haptics}
          onChange={(on) => settings.setFeel('haptics', on)}
        />
        <SwitchRow
          divider
          title={t('me.settings.reduceMotion')}
          sub={t('me.settings.reduceMotionSub')}
          value={settings.reduceMotion}
          onChange={(on) => settings.setFeel('reduceMotion', on)}
        />
      </SettingsGroup>
      <SettingsGroup title={t('me.settings.learnGroup')} className="pb-2.5">
        <SettingsRow
          icon="target"
          label={t('me.settings.dailyGoal')}
          accessory={
            <PillTabs
              compact
              accessibilityLabel={t('me.settings.dailyGoal')}
              value={goal}
              onChange={(v) => updateProfile({ dailyMinutes: GOAL_MINUTES[v] })}
              options={GOALS.map((g) => ({
                value: g,
                label: g === goal ? t('me.settings.minutes', { count: Number(g) }) : g,
              }))}
            />
          }
        />
        <SettingsRow
          divider
          icon="moon"
          label={t('me.settings.quietHours')}
          value={quietLabel(settings.quietHours)}
          onPress={() => setSheet('quiet')}
        />
        <View className="gap-1.5 border-t border-border pt-1">
          <SettingsRow icon="bell" label={t('me.settings.notifications')} />
          <NotificationChips />
        </View>
      </SettingsGroup>
      <SettingsGroup title={t('me.settings.accountGroup')}>
        {guest ? (
          <SettingsRow
            icon="me"
            label={t('me.settings.createAccount')}
            onPress={() => router.push({ pathname: '/auth/account', params: { reason: 'save' } })}
          />
        ) : (
          <SettingsRow
            icon="edit"
            label={t('me.settings.nickname')}
            value={nickname}
            onPress={() => setSheet('nickname')}
          />
        )}
      </SettingsGroup>
      <SettingsGroup title={t('me.settings.aboutGroup')}>
        <SettingsRow
          icon="info"
          label={t('me.settings.version')}
          value={Constants.expoConfig?.version}
        />
        <SettingsRow
          divider
          icon="file"
          label={t('me.settings.licenses')}
          onPress={() => router.push('/me/licenses')}
        />
      </SettingsGroup>
      {guest ? null : (
        <View className="mt-1.5 flex-row gap-2">
          <View className="flex-1">
            <Button
              label={t('me.settings.signOut')}
              icon="logout"
              variant="secondary"
              size="md"
              onPress={() => setSheet('signOut')}
            />
          </View>
          <View className="flex-1">
            <Button
              label={t('me.settings.delete')}
              icon="trash"
              variant="danger"
              size="md"
              onPress={() => setSheet('delete')}
            />
          </View>
        </View>
      )}

      <ChoiceSheet<AppLocale>
        visible={sheet === 'language'}
        title={t('me.settings.languageSheet')}
        hint={t('me.settings.languageHint')}
        value={locale}
        onChange={setLocale}
        onClose={close}
        options={[
          { value: 'az', label: t('me.settings.languageNames.az') },
          { value: 'ru', label: t('me.settings.languageNames.ru') },
        ]}
      />
      <ChoiceSheet<QuietHours>
        visible={sheet === 'quiet'}
        title={t('me.settings.quietHours')}
        hint={t('me.settings.quietHint')}
        value={settings.quietHours}
        onChange={settings.setQuietHours}
        onClose={close}
        options={[...QUIET_HOURS, 'off' as const].map((v) => ({ value: v, label: quietLabel(v) }))}
      />
      <NicknameSheet visible={sheet === 'nickname'} onClose={close} />
      <ConfirmSheet
        visible={sheet === 'signOut'}
        title={t('me.settings.signOutTitle')}
        body={t('me.settings.signOutBody')}
        confirmLabel={t('me.settings.signOutConfirm')}
        onClose={close}
        onConfirm={leave}
      />
      <ConfirmSheet
        visible={sheet === 'delete'}
        title={t('me.settings.deleteTitle')}
        body={t('me.settings.deleteBody')}
        confirmLabel={t('me.settings.deleteConfirm')}
        danger
        onClose={close}
        onConfirm={leave}
      />
    </Screen>
  );
}
