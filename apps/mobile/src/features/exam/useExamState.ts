import { useLocalSearchParams } from 'expo-router';
import { useOnline } from './useOnline';

/**
 * Whether the full plan is locked and the app offline. The plan is free in the demo, so it is
 * never locked; in development builds `?demo=locked` and `?demo=offline` show those states on
 * demand (for design review), since phones report online until a network listener exists.
 */
export function useExamState(): { locked: boolean; offline: boolean } {
  const { demo } = useLocalSearchParams<{ demo?: string }>();
  const online = useOnline();
  const preview = __DEV__ ? demo : undefined;
  return { locked: preview === 'locked', offline: preview === 'offline' || !online };
}
