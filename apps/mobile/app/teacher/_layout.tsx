import { Stack } from 'expo-router';
import { useStackMotion } from '@/features/transitions/useStackMotion';

/** Teacher screens: the tabs and the screens pushed above them (URLs under /teacher). */
export default function TeacherLayout() {
  return <Stack screenOptions={useStackMotion()} />;
}
