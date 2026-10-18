import { Stack } from 'expo-router';
import { StreakSheet } from '@/components/today/StreakSheet';

/** The streak stopped: a sheet over "Bu gün" (opened by the server's motivation event, P2). */
export default function StudentStreakScreen() {
  return (
    <>
      {/* A moment over the home screen, not a page of its own. */}
      <Stack.Screen
        options={{
          presentation: 'transparentModal',
          animation: 'fade',
          contentStyle: { backgroundColor: 'transparent' },
        }}
      />
      <StreakSheet />
    </>
  );
}
