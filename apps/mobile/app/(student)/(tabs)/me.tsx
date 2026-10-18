import { MeAccount } from '@/components/me/MeAccount';
import { MeGuest } from '@/components/me/MeGuest';
import { useGuestMode } from '@/features/me/useGuestMode';

/** "Mən": the student's own page (architecture Ş11); a guest sees why an account helps. */
export default function MeScreen() {
  return useGuestMode() ? <MeGuest /> : <MeAccount />;
}
