import { useLocalSearchParams } from 'expo-router';
import { useExamAccess } from './queries';
import { useOnline } from './useOnline';

/**
 * Whether the full plan is locked and the app offline. In development builds `?demo=locked` and
 * `?demo=offline` show those states on demand (for design review), since the demo student has
 * premium and phones report online until a network listener exists.
 */
export function useExamState(): { locked: boolean; offline: boolean } {
  const { demo } = useLocalSearchParams<{ demo?: string }>();
  const access = useExamAccess();
  const online = useOnline();
  const preview = __DEV__ ? demo : undefined;
  return {
    locked: preview === 'locked' || access.data?.fullPlan === false,
    offline: preview === 'offline' || !online,
  };
}
