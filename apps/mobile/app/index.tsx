import { Redirect } from 'expo-router';
import { ROLE_HOME } from '@/features/app/roleHome';
import { useAppHydrated, useAppStore } from '@/features/app/appStore';

/** Entry: first launch until it is finished, then the active role's home. */
export default function Index() {
  const hydrated = useAppHydrated();
  const onboarded = useAppStore((s) => s.onboarded);
  const role = useAppStore((s) => s.role);

  // The splash screen stays up until the stored state is read (see the root layout).
  if (!hydrated) return null;
  if (!onboarded || role === null) return <Redirect href="/onboarding" />;
  return <Redirect href={ROLE_HOME[role]} />;
}
