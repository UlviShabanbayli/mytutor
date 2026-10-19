import { useLocalSearchParams } from 'expo-router';
import { HiveLoading } from '@/components/learn/HiveLoading';
import { HivePreparing } from '@/components/learn/HivePreparing';
import { HiveView } from '@/components/learn/HiveView';
import { ErrorState, Screen, ScreenHeader } from '@/components/ui';
import { useHive, useOnline } from '@/features/learn/queries';

/** The hive box of a textbook (a hive id, or a subject id such as the tests API's). */
export default function HiveScreen() {
  const { id, open } = useLocalSearchParams<{ id: string; open?: string }>();
  const view = useHive(id);
  const online = useOnline();

  if (view.status === 'pending') return <HiveLoading />;
  if (view.status === 'preparing') return <HivePreparing subject={view.subject} />;
  if (view.status === 'error')
    return (
      <Screen>
        <ScreenHeader title="" />
        <ErrorState onRetry={view.retry} />
      </Screen>
    );
  return <HiveView hive={view.hive} online={online} openUnitId={open} />;
}
