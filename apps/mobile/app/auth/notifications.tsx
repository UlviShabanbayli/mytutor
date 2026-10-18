import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Mascot } from '@/components/mascot/Mascot';
import { FooterNote } from '@/components/onboarding/FooterNote';
import { NotificationPreview } from '@/components/onboarding/NotificationPreview';
import { QuietButton } from '@/components/onboarding/QuietButton';
import { StepScreen } from '@/components/onboarding/StepScreen';
import { Button, Icon, IconButton, Text } from '@/components/ui';
import { useAppStore } from '@/features/app/appStore';
import { ROLE_HOME } from '@/features/app/roleHome';
import { azLocativeEnding } from '@/features/onboarding/reminder';
import { type ReminderConsent, useOnboardingStore } from '@/features/onboarding/store';

/**
 * Asked once, after the first lesson (the study area opens it while `useShouldAskReminders()`
 * is true). The answer is kept on the device; with expo-notifications (architecture P1) "yes"
 * also asks the system permission and schedules the reminder.
 */
export default function AuthNotificationsScreen() {
  const { t } = useTranslation();
  const time = useOnboardingStore((s) => s.reminderTime);
  const setReminders = useOnboardingStore((s) => s.setReminders);

  const answer = (consent: ReminderConsent) => {
    setReminders(consent);
    if (router.canGoBack()) router.back();
    else router.replace(ROLE_HOME[useAppStore.getState().role ?? 'student']);
  };

  return (
    <StepScreen
      header={
        <View className="items-end px-2">
          <IconButton
            icon="close"
            color="muted"
            accessibilityLabel={t('common.close')}
            onPress={() => answer('off')}
          />
        </View>
      }
      contentClassName="items-center gap-3 pt-0"
      footer={
        <>
          <Button
            label={t('onboarding.notifications.allow')}
            icon="bell"
            onPress={() => answer('on')}
          />
          <QuietButton
            label={t('onboarding.notifications.decline')}
            onPress={() => answer('off')}
          />
        </>
      }
    >
      <View className="h-8 flex-row items-center gap-1.5 rounded-full bg-ok-bg px-3">
        <Icon name="check" size={16} color="ok" />
        <Text variant="overline" tone="ok" className="text-xs">
          {t('onboarding.notifications.badge')}
        </Text>
      </View>
      <Mascot moment="correct" size={150} decorative />
      <Text variant="title" className="text-center text-2xl">
        {t('onboarding.notifications.title')}
      </Text>
      <Text tone="muted" className="max-w-[320px] text-center">
        {t('onboarding.notifications.body', { time, ending: azLocativeEnding(time) })}
      </Text>
      <NotificationPreview time={time} />
      <FooterNote icon="moon" text={t('onboarding.notifications.quiet')} />
    </StepScreen>
  );
}
