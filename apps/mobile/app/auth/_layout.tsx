import { Stack } from 'expo-router';

/** Account screens: phone, SMS code, age, parent consent, notification permission. */
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
