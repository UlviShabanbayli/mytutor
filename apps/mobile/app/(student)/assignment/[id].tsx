import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AssignmentView } from '@/components/me/AssignmentView';
import { EmptyState, ErrorState, LoadingState, Screen, ScreenHeader } from '@/components/ui';
import { useAssignment } from '@/features/me/queries';

/** A class homework (architecture Ş10 "Tapşırıq icrası"); tests open in the test flow instead. */
export default function AssignmentScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useAssignment(id);

  if (query.isPending || query.isError || query.data === null) {
    return (
      <Screen>
        <ScreenHeader title={t('me.assignment.overline')} />
        {query.isPending ? (
          <LoadingState />
        ) : query.isError ? (
          <ErrorState onRetry={() => void query.refetch()} />
        ) : (
          <EmptyState
            title={t('me.assignment.notFoundTitle')}
            description={t('me.assignment.notFoundBody')}
          />
        )}
      </Screen>
    );
  }

  return <AssignmentView item={query.data} />;
}
