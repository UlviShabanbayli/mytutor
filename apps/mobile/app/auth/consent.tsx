import { useState } from 'react';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ConsentWaitingCard } from '@/components/onboarding/ConsentWaitingCard';
import { ParentSeesList } from '@/components/onboarding/ParentSeesList';
import { PhoneField } from '@/components/onboarding/PhoneField';
import { StepScreen } from '@/components/onboarding/StepScreen';
import { StepTitle } from '@/components/onboarding/StepTitle';
import { Banner, Button, Icon } from '@/components/ui';
import { useAuthStore } from '@/features/auth/authStore';
import { useSecondsLeft } from '@/features/auth/countdown';
import { maskPhone, nationalDigits, phoneStatus } from '@/features/auth/phone';
import { useSendCode } from '@/features/auth/queries';
import { useLeaveAuth } from '@/features/auth/useLeaveAuth';

/**
 * Under 13: the account opens with a parent's approval (architecture: "Yaş və razılıq"). The
 * student enters the parent's number, a code goes there, the parent tells the code (or approves
 * from the SMS link). The student may go on as a guest meanwhile.
 */
export default function AuthConsentScreen() {
  const { t } = useTranslation();
  const ownPhone = useAuthStore((s) => s.phone.self);
  const parentPhone = useAuthStore((s) => s.phone.parent);
  const resendAt = useAuthStore((s) => s.resendAt.parent);
  const setPhone = useAuthStore((s) => s.setPhone);
  const setResendAt = useAuthStore((s) => s.setResendAt);
  const secondsLeft = useSecondsLeft(resendAt);
  const send = useSendCode('parent');
  const leave = useLeaveAuth();
  const [digits, setDigits] = useState(() => (parentPhone ? nationalDigits(parentPhone) : ''));
  const sent = parentPhone !== null && resendAt !== null;
  const status = phoneStatus(digits);
  const sameNumber = status.kind === 'valid' && status.e164 === ownPhone;

  const message = sameNumber
    ? { tone: 'err' as const, text: t('onboarding.consent.sameNumber') }
    : status.kind === 'incomplete'
      ? { tone: 'info' as const, text: t('onboarding.phone.missing', { count: status.missing }) }
      : status.kind === 'invalid'
        ? { tone: 'err' as const, text: t('onboarding.phone.invalid') }
        : null;

  const sendCode = () => {
    if (status.kind !== 'valid' || sameNumber) return;
    setPhone('parent', status.e164);
    send.mutate(status.e164);
  };

  const changeNumber = () => {
    setPhone('parent', null);
    setResendAt('parent', null);
  };

  return (
    <StepScreen
      step="consent"
      contentClassName="gap-3.5"
      footer={
        <>
          {sent ? (
            <Button
              label={t('onboarding.consent.enterCode')}
              onPress={() => router.push({ pathname: '/auth/otp', params: { for: 'parent' } })}
            />
          ) : (
            <Button
              label={t('onboarding.consent.send')}
              disabled={status.kind !== 'valid' || sameNumber}
              loading={send.isPending}
              onPress={sendCode}
            />
          )}
          <Button
            label={t('onboarding.consent.asGuest')}
            variant="text"
            size="md"
            onPress={leave}
          />
        </>
      }
    >
      <StepTitle
        title={t('onboarding.consent.title')}
        subtitle={t('onboarding.consent.subtitle')}
      />
      <PhoneField
        label={t('onboarding.consent.label')}
        digits={digits}
        onChangeDigits={setDigits}
        message={sent ? null : message}
        editable={!sent}
        autoFocus={!sent}
        onSubmit={sendCode}
        trailing={
          sent ? (
            <Icon
              name="check"
              size={22}
              color="ok"
              accessibilityLabel={t('onboarding.consent.sent')}
            />
          ) : null
        }
      />
      {send.isError ? <Banner kind="error" message={t('onboarding.phone.sendError')} /> : null}
      {sent ? (
        <ConsentWaitingCard
          maskedPhone={maskPhone(parentPhone)}
          secondsLeft={secondsLeft}
          onResend={() => send.mutate(parentPhone)}
          resending={send.isPending}
          onChangeNumber={changeNumber}
        />
      ) : null}
      <ParentSeesList />
    </StepScreen>
  );
}
