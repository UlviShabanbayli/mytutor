import { Redirect } from 'expo-router';
import { LeagueBoard } from '@/components/me/LeagueBoard';
import { LeagueOptIn } from '@/components/me/LeagueOptIn';
import { useMeStore } from '@/features/me/store';

/** Çiçək liqası (architecture P2): opt-in first, then the weekly table; needs an account. */
export default function LeagueScreen() {
  const guest = useMeStore((s) => s.guest);
  const joined = useMeStore((s) => s.leagueJoined);
  if (guest) return <Redirect href={{ pathname: '/auth/account', params: { reason: 'league' } }} />;
  return joined ? <LeagueBoard /> : <LeagueOptIn />;
}
