import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { BottomInset } from '@/components/parent/BottomInset';
import { ConsentForm } from '@/components/parent/ConsentForm';
import { ParentStackHeader } from '@/components/parent/ParentStackHeader';
import { QueryView } from '@/components/parent/QueryView';
import { EmptyState, Screen } from '@/components/ui';
import { useConsentRequests } from '@/features/parent/queries';

/** Parental consent for a child under 13 opening an account (privacy rules, architecture V1). */
export default function ParentConsentScreen() {
  const { t } = useTranslation();
  const { childId } = useLocalSearchParams<{ childId?: string }>();
  const requests = useConsentRequests();

  return (
    <Screen>
      <ParentStackHeader title={t('parent.consent.title')} />
      <QueryView query={requests}>
        {(list) => {
          const request = list.find((r) => r.childId === childId) ?? list[0];
          return request ? (
            <ConsentForm key={request.childId} request={request} />
          ) : (
            <EmptyState
              moment="aiThinking"
              title={t('parent.consent.emptyTitle')}
              description={t('parent.consent.emptyBody')}
              actionLabel={t('parent.state.toKids')}
              onAction={() => router.dismissTo('/parent/kids')}
            />
          );
        }}
      </QueryView>
      <BottomInset />
    </Screen>
  );
}
