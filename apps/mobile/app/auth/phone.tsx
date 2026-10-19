import { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { NoteLine } from '@/components/onboarding/NoteLine';
import { PhoneField } from '@/components/onboarding/PhoneField';
import { StepScreen } from '@/components/onboarding/StepScreen';
import { StepTitle } from '@/components/onboarding/StepTitle';
import { TermsLine } from '@/components/onboarding/TermsLine';
import { Banner, Button } from '@/components/ui';
import { useAuthStore } from '@/features/auth/authStore';
import { nationalDigits, phoneStatus } from '@/features/auth/phone';
import { useSendCode } from '@/features/auth/queries';
import { isAuthReason } from '@/features/auth/types';

/**
 * Account step 1: the student's mobile number (+994). `?reason=` starts a new flow when the
 * phone is the first account screen (teacher, parent, "Hesabım var — daxil ol").
 */
export default function AuthPhoneScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ reason?: string }>();
  const startFlow = useAuthStore((s) => s.startFlow);
  const stored = useAuthStore((s) => s.phone.self);
  const setPhone = useAuthStore((s) => s.setPhone);
  const [digits, setDigits] = useState(() => (stored ? nationalDigits(stored) : ''));
  const send = useSendCode('self');
  const status = phoneStatus(digits);

  useEffect(() => {
    if (isAuthReason(params.reason)) startFlow(params.reason);
  }, [params.reason, startFlow]);

  const message =
    status.kind === 'incomplete'
      ? { tone: 'info' as const, text: t('onboarding.phone.missing', { count: status.missing }) }
      : status.kind === 'invalid'
        ? { tone: 'err' as const, text: t('onboarding.phone.invalid') }
        : null;

  const submit = () => {
    if (status.kind !== 'valid' || send.isPending) return;
    setPhone('self', status.e164);
    send.mutate(status.e164, { onSuccess: () => router.push('/auth/otp') });
  };

  return (
    <StepScreen
      step="phone"
      contentClassName="gap-3.5"
      footer={
        <>
          <TermsLine />
          <Button
            label={t('onboarding.phone.send')}
            disabled={status.kind !== 'valid'}
            loading={send.isPending}
            onPress={submit}
          />
        </>
      }
    >
      <StepTitle title={t('onboarding.phone.title')} subtitle={t('onboarding.phone.subtitle')} />
      <PhoneField
        label={t('onboarding.phone.label')}
        digits={digits}
        onChangeDigits={setDigits}
        message={message}
        autoFocus
        onSubmit={submit}
      />
      {send.isError ? <Banner kind="error" message={t('onboarding.phone.sendError')} /> : null}
      <NoteLine icon="shield" iconColor="ok" text={t('onboarding.phone.privacy')} />
    </StepScreen>
  );
}
