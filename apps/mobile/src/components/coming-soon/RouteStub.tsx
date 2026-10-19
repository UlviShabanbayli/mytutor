import { useTranslation } from 'react-i18next';
import { EmptyState, Screen, ScreenHeader } from '@/components/ui';

/**
 * A screen whose area is not built yet: a back button and a calm "coming soon". Every route of
 * the architecture exists from the start, so areas can link to each other before they land.
 */
export function RouteStub() {
  const { t } = useTranslation();

  return (
    <Screen>
      <ScreenHeader title={t('common.comingSoon')} />
      <EmptyState moment="aiThinking" title={t('common.comingSoon')} />
    </Screen>
  );
}
