import { Stack, useLocalSearchParams } from 'expo-router';
import { ComebackSheet } from '@/components/today/ComebackSheet';

/** Back after a long break: a sheet over "Bu gün" (the home screen opens it, P1). */
export default function StudentComebackScreen() {
  const { days } = useLocalSearchParams<{ days?: string }>();
  const away = Number(days);

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
      <ComebackSheet awayDays={Number.isInteger(away) && away > 0 ? away : null} />
    </>
  );
}
