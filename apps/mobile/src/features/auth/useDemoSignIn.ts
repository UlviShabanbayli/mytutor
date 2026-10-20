import { useCallback } from 'react';
import { router, useNavigation } from 'expo-router';
import { dailyMinutesSchema, meResponseSchema } from '@mytutor/schemas';
import type { DemoAccount } from '@mytutor/types';
import { useAppStore } from '@/features/app/appStore';
import { ROLE_HOME } from '@/features/app/roleHome';
import { apiGet } from '@/lib/api';
import { useDemoPersonaStore } from '@/lib/demoPersona';
import { useAuthStore } from './authStore';
import { ageGroupOfAccount } from './demoAccounts';
import { isAskReason } from './types';

/** A student's grade, goal and daily minutes from the demo world; null when it can't be read. */
async function knownProfile(account: DemoAccount) {
  try {
    const me = await apiGet('/v1/me', { persona: account.persona, parse: meResponseSchema.parse });
    const minutes = dailyMinutesSchema.safeParse(me.profile.dailyMinutes);
    return {
      grade: me.profile.grade,
      goal: me.profile.goal,
      dailyMinutes: minutes.success ? minutes.data : null,
    };
  } catch {
    return null;
  }
}

/**
 * Signs in to an existing demo account (a `DEMO_ACCOUNTS` phone with the SMS code): its role and
 * demo world (persona) become the app's, first launch is over and the questions the account
 * already answers (a student's grade, goal and daily minutes) are not asked. A student who was
 * asked for an account by a screen goes back to it; everyone else opens their role's home.
 */
export function useDemoSignIn(): (account: DemoAccount) => Promise<void> {
  const navigation = useNavigation();

  return useCallback(
    async (account) => {
      const { reason, createAccount } = useAuthStore.getState();
      const app = useAppStore.getState();
      const roleBefore = app.role;
      const personas = useDemoPersonaStore.getState();
      // Switching clears the query cache, so only switch when the world really changes.
      if (personas.persona !== account.persona) personas.setPersona(account.persona);
      if (account.role === 'student') {
        const profile = await knownProfile(account);
        if (profile) app.updateProfile(profile);
      }
      app.setRole(account.role);
      createAccount(ageGroupOfAccount(account), 'not_needed');
      app.completeOnboarding();

      const root = navigation.getParent();
      const popped = root !== undefined && root.canGoBack();
      if (popped) root.goBack();
      const backToAsker =
        popped && isAskReason(reason) && account.role === 'student' && roleBefore === 'student';
      if (!backToAsker) router.replace(ROLE_HOME[account.role]);
    },
    [navigation],
  );
}
