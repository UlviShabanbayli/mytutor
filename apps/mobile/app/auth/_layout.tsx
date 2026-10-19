import { Stack } from 'expo-router';

/** Account screens: phone, SMS code, age, parent consent, notification permission. */
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
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
      <Stack.Screen name="notifications" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
