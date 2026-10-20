import { useLocalSearchParams } from 'expo-router';
import { HivePreparing } from '@/components/learn/HivePreparing';
import { TextbookPicker } from '@/components/learn/TextbookPicker';
import { ErrorState, LoadingState, Screen, ScreenHeader } from '@/components/ui';
import { afterTextbookPick } from '@/features/learn/navigation';
import { useHive } from '@/features/learn/queries';

/** Which textbook the school uses: asked on a hive's first open, changeable from its header. */
export default function TextbookScreen() {
  const { hiveId, first } = useLocalSearchParams<{ hiveId?: string; first?: string }>();
  const view = useHive(hiveId);

  if (view.status === 'pending')
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  if (view.status === 'preparing') return <HivePreparing subject={view.subject} />;
  if (view.status === 'error')
    return (
      <Screen>
        <ScreenHeader title="" />
        <ErrorState onRetry={view.retry} />
      </Screen>
    );
  const { hive } = view;
  return <TextbookPicker hive={hive} onDone={() => afterTextbookPick(hive.id, first === '1')} />;
}
