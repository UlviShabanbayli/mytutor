import { useLocalSearchParams } from 'expo-router';
import { TestSession } from '@/components/tests/TestSession';
import { ErrorState, LoadingState, Screen } from '@/components/ui';
import { useTest } from '@/features/tests/queries';

export default function TestScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useTest(id);

  if (query.isPending)
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

  return <TestSession test={query.data} />;
}
