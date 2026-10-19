import { Redirect } from 'expo-router';
import { ParentLinkView } from '@/components/me/ParentLinkView';
import { useMeStore } from '@/features/me/store';

/** Linking a parent from the student's side (architecture V1); needs an account. */
export default function ParentLinkScreen() {
  const guest = useMeStore((s) => s.guest);
  if (guest) return <Redirect href={{ pathname: '/auth/account', params: { reason: 'parent' } }} />;
  return <ParentLinkView />;
}
