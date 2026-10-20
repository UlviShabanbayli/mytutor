import { Stack } from 'expo-router';
import { useStepStackMotion } from '@/features/transitions/useStepStackMotion';

/** First launch: language, role and the role's first questions (no subject choice). */
export default function OnboardingLayout() {
  return <Stack screenOptions={useStepStackMotion()} />;
}
