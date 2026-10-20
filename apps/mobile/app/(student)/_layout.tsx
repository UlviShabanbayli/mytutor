import { Stack } from 'expo-router';
import { useStackMotion } from '@/features/transitions/useStackMotion';
import { duration } from '@/motion';

// A deep link to a screen above the tabs (e.g. the comeback sheet) still has the tabs below it.
export const unstable_settings = { initialRouteName: '(tabs)' };

/** Student screens above the tabs: subject, topic, lesson, test and the rest of the areas. */
export default function StudentLayout() {
  const stackMotion = useStackMotion();
  const reduced = stackMotion.animation === 'fade';

  return (
    <Stack screenOptions={stackMotion}>
      {/* A running test is left only through its own exit, never by a swipe. */}
      <Stack.Screen name="test/[id]/index" options={{ gestureEnabled: false }} />
      {/* transitions.handoff: the test fades into its result while the topic cell flies over. */}
      <Stack.Screen
        name="test/[id]/result"
        options={{
          animation: 'fade',
          animationDuration: reduced ? duration.reduced : duration.step,
          animationTypeForReplace: 'push',
        }}
      />
      {/* transitions.tabs: the Soruş camera comes up from the bottom. It stays a card, not a
          modal, because it is replaced by the crop screen in the same stack. */}
      <Stack.Screen
        name="ask/camera"
        options={{ animation: reduced ? 'fade' : 'slide_from_bottom' }}
      />
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
