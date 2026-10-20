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
import { useLinkChild } from '@/features/parent/writes';

/**
 * The parent's first step after the account (architecture V1): the child's code and whose code
 * it is. Linking writes `child.linked`, and the parent's home opens with the child on it; a
 * child the parent already follows needs no new link.
 */
export default function OnboardingParentScreen() {
  const { t } = useTranslation();
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const [code, setCode] = useState('');
  const lookup = useChildCode(code);
  const link = useLinkChild();
  const complete = code.length === CHILD_CODE_LENGTH;
  const found = lookup.data ?? null;
  const status = !complete
    ? null
    : lookup.isPending
      ? 'checking'
      : lookup.isError || link.isError
        ? 'error'
        : found === null
          ? 'not_found'
          : found.expired
            ? 'expired'
            : 'found';

  const finish = () => {
    completeOnboarding();
    router.replace(ROLE_HOME.parent);
  };

  const requestLink = () => {
    if (found?.alreadyLinked) finish();
    else link.mutate(code, { onSuccess: finish });
  };

  return (
    <StepScreen
      step="parent"
      footer={
        <Button
          label={t(found?.alreadyLinked ? 'onboarding.continue' : 'onboarding.parentStart.submit')}
          disabled={status !== 'found'}
          loading={link.isPending}
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
        onChange={(next) => {
          setCode(next);
          if (link.isError) link.reset();
        }}
        length={CHILD_CODE_LENGTH}
        kind="letters"
        splitAfter={3}
        normalize={normalizeChildCode}
        error={status === 'not_found' || status === 'expired'}
        accessibilityLabel={t('onboarding.parentStart.codeLabel')}
      />
      {status ? <ChildCodeStatus state={status} child={found} /> : null}
      <HowItWorks />
      <NoteLine icon="eye" text={t('onboarding.parentStart.note')} />
    </StepScreen>
  );
}
