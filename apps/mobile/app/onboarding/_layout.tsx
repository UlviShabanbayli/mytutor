import { Stack } from 'expo-router';

/** First launch: language, role and the role's first questions (no subject choice). */
export default function OnboardingLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
