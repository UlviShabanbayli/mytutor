import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { BottomInset } from '@/components/parent/BottomInset';
import { ParentStackHeader } from '@/components/parent/ParentStackHeader';
import { PendingRequestView } from '@/components/parent/PendingRequestView';
import { QueryView } from '@/components/parent/QueryView';
import { EmptyState, Screen } from '@/components/ui';
import { useLinkRequest } from '@/features/parent/queries';

/** Waiting for the child's approval after the code was accepted (architecture V1). */
export default function ParentPendingScreen() {
  const { t } = useTranslation();
  const request = useLinkRequest();

  return (
    <Screen>
      <ParentStackHeader
        title={t('parent.pending.title')}
        leading="close"
        onLeading={() => router.dismissTo('/parent/kids')}
      />
      <QueryView query={request}>
        {(found) =>
          found ? (
            <PendingRequestView request={found} />
          ) : (
            <EmptyState
              title={t('parent.pending.emptyTitle')}
              description={t('parent.pending.emptyBody')}
              actionLabel={t('parent.state.toKids')}
              onAction={() => router.dismissTo('/parent/kids')}
            />
          )
        }
      </QueryView>
      <BottomInset />
    </Screen>
  );
}
