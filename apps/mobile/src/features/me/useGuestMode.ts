import { useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useMeStore } from './store';

/**
 * Whether the student has no account yet. Until accounts exist (architecture Ş1) the demo
 * shows Nərmin's account; `/me?guest=1` switches to the guest page and `/me?guest=0` back.
 */
export function useGuestMode(): boolean {
  const { guest: param } = useLocalSearchParams<{ guest?: string }>();
  const setGuest = useMeStore((s) => s.setGuest);
  useEffect(() => {
    if (param !== undefined) setGuest(param === '1');
  }, [param, setGuest]);
  return useMeStore((s) => s.guest);
}
