import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CodeBoxes } from '@/components/onboarding/CodeBoxes';
import { CodeFailureAlert } from '@/components/onboarding/CodeFailureAlert';
import { DevCodeHint } from '@/components/onboarding/DevCodeHint';
import { ResendButton } from '@/components/onboarding/ResendButton';
import { StepScreen } from '@/components/onboarding/StepScreen';
import { StepTitle } from '@/components/onboarding/StepTitle';
import { Banner, Button, Text } from '@/components/ui';
import { formatCountdown } from '@/features/auth/countdown';
import { maskPhone } from '@/features/auth/phone';
import { CODE_LENGTH, useCodeEntry } from '@/features/auth/useCodeEntry';

const digitsOnly = (text: string) => text.replace(/\D/g, '').slice(0, CODE_LENGTH);

/**
 * Account step 2: the SMS code, checked as soon as six digits are in. A wrong code is a calm
 * state of this screen (red boxes, attempts left). `?for=parent` checks the code sent to the
 * parent of a student under 13; approving it opens the account with the parent's consent.
 */
export default function AuthOtpScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ for?: string }>();
  const target = params.for === 'parent' ? 'parent' : 'self';
  const entry = useCodeEntry(target);

  // Opened without a number (e.g. a stale link): the number comes first.
  if (entry.phone === null) return <Redirect href="/auth/phone" />;

  return (
    <StepScreen step={target === 'parent' ? 'consent' : 'otp'} contentClassName="gap-3.5">
      <StepTitle
        title={t('onboarding.otp.title')}
        subtitle={
          <>
            {t('onboarding.otp.sentBefore')}
            <Text className="font-sans-black">{maskPhone(entry.phone)}</Text>
            {t('onboarding.otp.sentAfter')}
          </>
        }
      />
      <CodeBoxes
        value={entry.code}
        onChange={entry.onChange}
        length={CODE_LENGTH}
        kind="digits"
        normalize={digitsOnly}
        error={entry.failure !== null}
        editable={!entry.blocked && !entry.checking}
        accessibilityLabel={t('onboarding.otp.group')}
      />
      {entry.failure ? <CodeFailureAlert failure={entry.failure} /> : null}
      {entry.checking ? (
        <Text variant="caption" tone="muted" accessibilityLiveRegion="polite">
          {t('onboarding.otp.checking')}
        </Text>
      ) : null}
      {entry.checkFailed || entry.sendFailed ? (
        <Banner
          kind="error"
          message={t(
            entry.checkFailed ? 'onboarding.otp.checkError' : 'onboarding.phone.sendError',
          )}
        />
      ) : null}
      <View className="flex-row items-center justify-between gap-2">
        <ResendButton
          secondsLeft={entry.secondsLeft}
          waitingLabel={t('onboarding.otp.resendIn', {
            time: formatCountdown(entry.secondsLeft),
          })}
          label={t('onboarding.otp.resend')}
          onPress={entry.resend}
          busy={entry.resending}
        />
        <Button
          label={t('onboarding.otp.changeNumber')}
          variant="text"
          size="md"
          onPress={router.back}
        />
      </View>
      <DevCodeHint />
    </StepScreen>
  );
}
