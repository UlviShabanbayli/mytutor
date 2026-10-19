import { Stack } from 'expo-router';

// A deep link to a screen above the tabs (e.g. the comeback sheet) still has the tabs below it.
export const unstable_settings = { initialRouteName: '(tabs)' };

/** Student screens above the tabs: subject, topic, lesson, test and the rest of the areas. */
export default function StudentLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* A running test is left only through its own exit, never by a swipe. */}
      <Stack.Screen name="test/[id]/index" options={{ gestureEnabled: false }} />
      {/* Moments shown as sheets over "Bu gün": the screen behind stays visible. */}
      <Stack.Screen
        name="comeback"
        options={{ presentation: 'transparentModal', animation: 'fade' }}
      />
      <Stack.Screen
        name="streak"
        options={{ presentation: 'transparentModal', animation: 'fade' }}
      />
    </Stack>
  );
}
