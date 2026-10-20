import { Stack } from 'expo-router';
import { useStackMotion } from '@/features/transitions/useStackMotion';

/** Parent screens: the tabs and the screens pushed above them (URLs under /parent). */
export default function ParentLayout() {
  return <Stack screenOptions={useStackMotion()} />;
}
