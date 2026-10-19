import { useLocalSearchParams } from 'expo-router';
import { MockIntroView } from '@/components/exam/MockIntroView';
import { MockNotFound } from '@/components/exam/MockNotFound';
import { ErrorState, LoadingState, Screen } from '@/components/ui';
import { useMockRunHydrated } from '@/features/exam/mockRunStore';
import { useMock } from '@/features/exam/queries';

/** Sınaq qaydaları: what to know before the clock starts. */
export default function MockIntroScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const hydrated = useMockRunHydrated();
  const query = useMock(id);

  if (query.data === null) return <MockNotFound />;
  return (
    <Screen className="gap-2.5 pt-1">
      {!hydrated || query.isPending ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState onRetry={() => void query.refetch()} />
      ) : (
        <MockIntroView mock={query.data} />
      )}
    </Screen>
  );
}
