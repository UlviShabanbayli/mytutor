import { useState } from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Role } from '@mytutor/types';
import { Mascot } from '@/components/mascot/Mascot';
import { ChoiceCard } from '@/components/onboarding/ChoiceCard';
import { NoteLine } from '@/components/onboarding/NoteLine';
import { StepScreen } from '@/components/onboarding/StepScreen';
import { StepStill } from '@/components/onboarding/StepStill';
import { StepTitle } from '@/components/onboarding/StepTitle';
import { Button, type IconName } from '@/components/ui';
import { useAppStore } from '@/features/app/appStore';
import { useHasAccount } from '@/features/auth/authStore';

const ROLES: { role: Role; icon: IconName }[] = [
  { role: 'student', icon: 'book' },
  { role: 'teacher', icon: 'users' },
  { role: 'parent', icon: 'chart' },
];

/**
 * Step 2: who uses the app. Students continue with their questions as guests; teachers and
 * parents make an account first (they need one to open a class or link a child).
 */
export default function OnboardingRoleScreen() {
  const { t } = useTranslation();
  const storedRole = useAppStore((s) => s.role);
  const setRole = useAppStore((s) => s.setRole);
  const hasAccount = useHasAccount();
  const [role, setChoice] = useState<Role>(storedRole ?? 'student');

  const next = () => {
    setRole(role);
    if (role === 'student') router.push('/onboarding/grade');
    // Coming back here with an account already made: straight to the role's first step.
    else if (hasAccount)
      router.push(role === 'teacher' ? '/onboarding/teacher' : '/onboarding/parent');
    else router.push({ pathname: '/auth/phone', params: { reason: role } });
  };

  const signIn = () => {
    setRole(role);
    router.push({ pathname: '/auth/phone', params: { reason: 'sign_in' } });
  };

  return (
    <StepScreen
      step="role"
      footer={
        <>
          <Button label={t('onboarding.continue')} onPress={next} />
          <Button label={t('onboarding.haveAccount')} variant="text" size="md" onPress={signIn} />
        </>
      }
    >
      <View className="flex-row items-center gap-2">
        <StepTitle
          title={t('onboarding.role.title')}
          subtitle={t('onboarding.role.subtitle')}
          className="flex-1"
        />
        <StepStill>
          <Mascot moment="aiThinking" size={92} decorative />
        </StepStill>
      </View>
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel={t('onboarding.role.title')}
        className="gap-3"
      >
        {ROLES.map(({ role: value, icon }) => (
          <ChoiceCard
            key={value}
            icon={icon}
            title={t(`onboarding.role.${value}.title`)}
            description={t(`onboarding.role.${value}.description`)}
            selected={role === value}
            onPress={() => setChoice(value)}
          />
        ))}
      </View>
      <NoteLine icon="info" iconColor="info" text={t('onboarding.role.note')} />
    </StepScreen>
  );
}
