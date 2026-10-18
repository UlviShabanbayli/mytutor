import { Stack } from 'expo-router';

/** Student screens above the tabs: subject, topic, lesson, test and the rest of the areas. */
export default function StudentLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* A running test is left only through its own exit, never by a swipe. */}
      <Stack.Screen name="test/[id]/index" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
