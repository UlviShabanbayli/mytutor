import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Mascot } from '@/components/mascot/Mascot';
import { FooterNote } from '@/components/onboarding/FooterNote';
import { ReadySummary } from '@/components/onboarding/ReadySummary';
import { StepScreen } from '@/components/onboarding/StepScreen';
import { StepStill } from '@/components/onboarding/StepStill';
import { Button, Text } from '@/components/ui';
import { useAppStore } from '@/features/app/appStore';
import { ROLE_HOME } from '@/features/app/roleHome';
import { useReadySummary } from '@/features/onboarding/useReadySummary';

/** The end of first launch: the plan in a few lines, then start as a guest. */
export default function OnboardingReadyScreen() {
  const { t } = useTranslation();
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const { minutes, rows } = useReadySummary();

  const start = () => {
    completeOnboarding();
    router.replace(ROLE_HOME.student);
  };

  return (
    <StepScreen
      step="ready"
      footer={
        <>
          <Button label={t('onboarding.ready.start')} onPress={start} />
          <Button
            label={t('onboarding.haveAccount')}
            variant="text"
            size="md"
            onPress={() => router.push({ pathname: '/auth/phone', params: { reason: 'sign_in' } })}
          />
          <FooterNote icon="shield" text={t('onboarding.ready.guestNote')} />
        </>
      }
    >
      <View className="items-center gap-1.5">
        <StepStill>
          <Mascot moment="lessonDone" size={172} decorative />
        </StepStill>
        <Text variant="title" className="text-center text-3xl">
          {t('onboarding.ready.title')}
        </Text>
        <Text tone="muted" className="max-w-[300px] text-center">
          {t('onboarding.ready.body', { count: minutes })}
        </Text>
      </View>
      <ReadySummary rows={rows} accessibilityLabel={t('onboarding.ready.summary')} />
    </StepScreen>
  );
}
