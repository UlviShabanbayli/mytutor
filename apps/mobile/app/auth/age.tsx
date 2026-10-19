import { useState } from 'react';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Mascot } from '@/components/mascot/Mascot';
import { AgeWheel } from '@/components/onboarding/AgeWheel';
import { InfoNote } from '@/components/onboarding/InfoNote';
import { StepScreen } from '@/components/onboarding/StepScreen';
import { StepTitle } from '@/components/onboarding/StepTitle';
import { Button } from '@/components/ui';
import { useAppStore } from '@/features/app/appStore';
import { ageGroupOf, initialAge } from '@/features/auth/age';
import { useAuthStore } from '@/features/auth/authStore';
import { useLeaveAuth } from '@/features/auth/useLeaveAuth';

/**
 * Account step 3: the age, asked by law and kept only as an age group. Under 13 the account
 * waits for a parent's approval (the consent step); otherwise it opens now.
 */
export default function AuthAgeScreen() {
  const { t } = useTranslation();
  const role = useAppStore((s) => s.role);
  const grade = useAppStore((s) => s.profile.grade);
  const createAccount = useAuthStore((s) => s.createAccount);
  const leave = useLeaveAuth();
  const [age, setAge] = useState(() => initialAge(role, grade));

  const next = () => {
    const group = ageGroupOf(age);
    if (group === 'under_13') {
      router.push('/auth/consent');
      return;
    }
    createAccount(group, 'not_needed');
    leave();
  };

  return (
    <StepScreen step="age" footer={<Button label={t('onboarding.continue')} onPress={next} />}>
      <StepTitle title={t('onboarding.age.title')} subtitle={t('onboarding.age.subtitle')} />
      <AgeWheel value={age} onChange={setAge} />
      <InfoNote
        leading={<Mascot moment="aiExplains" size={64} decorative />}
        title={t('onboarding.age.noteTitle')}
        text={t('onboarding.age.noteBody')}
      />
    </StepScreen>
  );
}
