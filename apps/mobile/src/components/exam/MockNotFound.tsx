import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { EmptyState, Screen, ScreenHeader } from '@/components/ui';

/** A mock id that does not exist (an old link): back to the list. */
export function MockNotFound() {
  const { t } = useTranslation();

  return (
    <Screen>
      <ScreenHeader title={t('exam.mocks.title')} />
      <EmptyState
        moment="aiThinking"
        title={t('exam.notFound.title')}
        description={t('exam.notFound.body')}
        actionLabel={t('exam.notFound.cta')}
        onAction={() => router.replace('/exam/mocks')}
      />
    </Screen>
  );
}
