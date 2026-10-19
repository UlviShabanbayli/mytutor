import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Role } from '@mytutor/types';
import { Mascot } from '@/components/mascot/Mascot';
import { Button, Screen, Text } from '@/components/ui';
import { useAppStore } from '@/features/app/appStore';
import { ROLE_HOME } from '@/features/app/roleHome';

const ROLES: Role[] = ['student', 'teacher', 'parent'];

/** Pick a role and enter its interface (the full first-launch flow builds on this). */
export default function OnboardingRoleScreen() {
  const { t } = useTranslation();
  const setRole = useAppStore((s) => s.setRole);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);

  const choose = (role: Role) => {
    setRole(role);
    completeOnboarding();
    router.replace(ROLE_HOME[role]);
  };

  return (
    <Screen>
      <View className="flex-1 justify-center gap-6">
        <Mascot moment="greeting" size={140} className="self-center" />
        <Text variant="title" className="text-center">
          {t('onboarding.roleTitle')}
        </Text>
        <View className="gap-3">
          {ROLES.map((role) => (
            <Button
              key={role}
              label={t(`onboarding.role.${role}`)}
              variant={role === 'student' ? 'primary' : 'secondary'}
              onPress={() => choose(role)}
            />
          ))}
        </View>
      </View>
    </Screen>
  );
}
