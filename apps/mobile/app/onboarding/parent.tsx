import { useState } from 'react';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ChildCodeStatus } from '@/components/onboarding/ChildCodeStatus';
import { CodeBoxes } from '@/components/onboarding/CodeBoxes';
import { HowItWorks } from '@/components/onboarding/HowItWorks';
import { NoteLine } from '@/components/onboarding/NoteLine';
import { StepScreen } from '@/components/onboarding/StepScreen';
import { StepTitle } from '@/components/onboarding/StepTitle';
import { Button } from '@/components/ui';
import { useAppStore } from '@/features/app/appStore';
import { ROLE_HOME } from '@/features/app/roleHome';
import { CHILD_CODE_LENGTH, normalizeChildCode } from '@/features/onboarding/childCode';
import { useChildCode } from '@/features/onboarding/queries';

/**
 * The parent's first step after the account (architecture V1): the child's code, whose code it
 * is, and a link request. The child approves it; the parent area shows the waiting state.
 */
export default function OnboardingParentScreen() {
  const { t } = useTranslation();
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const [code, setCode] = useState('');
  const lookup = useChildCode(code);
  const complete = code.length === CHILD_CODE_LENGTH;
  const status = !complete
    ? null
    : lookup.isPending
      ? 'checking'
      : lookup.isError
        ? 'error'
        : lookup.data
          ? 'found'
          : 'not_found';

  const requestLink = () => {
    completeOnboarding();
    router.replace(ROLE_HOME.parent);
    router.push('/parent/pending');
  };

  return (
    <StepScreen
      step="parent"
      footer={
        <Button
          label={t('onboarding.parentStart.submit')}
          disabled={status !== 'found'}
          onPress={requestLink}
        />
      }
    >
      <StepTitle
        title={t('onboarding.parentStart.title')}
        subtitle={t('onboarding.parentStart.subtitle')}
      />
      <CodeBoxes
        value={code}
        onChange={setCode}
        length={CHILD_CODE_LENGTH}
        kind="letters"
        splitAfter={3}
        normalize={normalizeChildCode}
        error={status === 'not_found'}
        accessibilityLabel={t('onboarding.parentStart.codeLabel')}
      />
      {status ? <ChildCodeStatus state={status} child={lookup.data} /> : null}
      <HowItWorks />
      <NoteLine icon="eye" text={t('onboarding.parentStart.note')} />
    </StepScreen>
  );
}
