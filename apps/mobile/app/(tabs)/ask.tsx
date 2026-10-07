import { useTranslation } from 'react-i18next';
import { EmptyState, Screen, Text } from '@/components/ui';

// Placeholder until the ask feature lands; shows the empty state.
export default function AskScreen() {
  const { t } = useTranslation();

  return (
    <Screen>
      <Text variant="title">{t('ask.title')}</Text>
      <EmptyState
        icon="camera-outline"
        title={t('common.comingSoon')}
        description={t('ask.emptyDescription')}
      />
    </Screen>
  );
}
