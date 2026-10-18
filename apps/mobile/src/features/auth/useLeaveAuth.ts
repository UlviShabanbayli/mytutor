import { useCallback } from 'react';
import { router, useNavigation } from 'expo-router';
import { useAppStore } from '@/features/app/appStore';
import { ROLE_HOME } from '@/features/app/roleHome';
import { useAuthStore } from './authStore';

/**
 * Ends the account flow, with or without an account, and goes where its reason leads:
 * the screen that asked for an account, the teacher's or parent's first step, or the role's
 * home after "Hesabım var — daxil ol" on first launch.
 */
export function useLeaveAuth(): () => void {
  const navigation = useNavigation();

  return useCallback(() => {
    // Read at call time: the flow may have started a moment ago in the same handler.
    const { reason } = useAuthStore.getState();
    const { role, completeOnboarding } = useAppStore.getState();
    const home = ROLE_HOME[role ?? 'student'];

    // Pop the whole account stack at once, so its screens never stay behind the next one.
    const root = navigation.getParent();
    const popped = root !== undefined && root.canGoBack();
    if (popped) root.goBack();

    if (reason === 'teacher') {
      router.push('/onboarding/teacher');
    } else if (reason === 'parent') {
      router.push('/onboarding/parent');
    } else if (reason === 'sign_in') {
      completeOnboarding();
      router.replace(home);
    } else if (!popped) {
      // Opened from a link with nothing underneath: the role's home is the way back.
      router.replace(home);
    }
  }, [navigation]);
}
