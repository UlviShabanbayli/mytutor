import { useTranslation } from 'react-i18next';
import type { CodeFailure } from '@/features/auth/useCodeEntry';
import { CodeAlert } from './CodeAlert';

type CodeFailureAlertProps = {
  failure: CodeFailure;
};

/** Says why a code did not work: wrong (attempts left), used up, or expired. */
export function CodeFailureAlert({ failure }: CodeFailureAlertProps) {
  const { t } = useTranslation();

  if (failure.status === 'wrong') {
    return (
      <CodeAlert
        title={t('onboarding.otp.wrongTitle')}
        body={t('onboarding.otp.wrong', { count: failure.attemptsLeft })}
      />
    );
  }
  if (failure.status === 'locked') {
    return (
      <CodeAlert title={t('onboarding.otp.lockedTitle')} body={t('onboarding.otp.lockedBody')} />
    );
  }
  return (
    <CodeAlert title={t('onboarding.otp.noCodeTitle')} body={t('onboarding.otp.noCodeBody')} />
  );
}
