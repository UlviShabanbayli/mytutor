import { Redirect, Stack, useLocalSearchParams } from 'expo-router';
import { MockNotFound } from '@/components/exam/MockNotFound';
import { MockRunner } from '@/components/exam/MockRunner';
import { DepthScreen, ErrorState, LoadingState, Screen } from '@/components/ui';
import { mockHref, mockResultHref } from '@/features/exam/links';
import { useMockRunHydrated, useMockRunStore } from '@/features/exam/mockRunStore';
import { useMock } from '@/features/exam/queries';

/** A running mock. Without a running attempt it goes to the rules; once finished, to the result. */
export default function MockRunScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const hydrated = useMockRunHydrated();
  const query = useMock(id);
  const attempt = useMockRunStore((s) => s.attempts[id]);

  if (!hydrated || query.isPending)
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  if (query.isError)
    return (
      <Screen>
        <ErrorState onRetry={() => void query.refetch()} />
      </Screen>
    );
  if (query.data === null) return <MockNotFound />;
  if (!attempt) return <Redirect href={mockHref(id)} />;
  if (attempt.finishedAt !== null) return <Redirect href={mockResultHref(id)} />;

  return (
    <>
      {/* A running mock is left only through its own exit, never by a swipe. */}
      <Stack.Screen options={{ gestureEnabled: false }} />
      {/* The exit dialog makes the running mock step back behind it (transitions.dialog C). */}
      <DepthScreen>
        <MockRunner mock={query.data} attempt={attempt} />
      </DepthScreen>
    </>
  );
}
