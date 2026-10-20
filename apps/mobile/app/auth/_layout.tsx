import { Stack } from 'expo-router';
import { useStepStackMotion } from '@/features/transitions/useStepStackMotion';

/** Account screens: phone, SMS code, age, parent consent, notification permission. */
export default function AuthLayout() {
  const stepMotion = useStepStackMotion();

  return (
    <Stack screenOptions={stepMotion}>
      {/* The "account needed" sheet fades in over a scrim instead of sliding in as a page. */}
      <Stack.Screen
        name="account"
        options={{
          presentation: 'transparentModal',
          animation: 'fade',
          contentStyle: { backgroundColor: 'transparent' },
        }}
      />
      {/* The permission question after the first lesson is a modal moment, closed with ×. */}
      <Stack.Screen
        name="notifications"
        options={{
          presentation: 'modal',
          animation: stepMotion.animation === 'fade' ? 'fade' : 'default',
        }}
      />
    </Stack>
  );
}
