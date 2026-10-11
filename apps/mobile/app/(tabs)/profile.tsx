import { useTranslation } from 'react-i18next';
import { EmptyState, Screen, Text } from '@/components/ui';

// Placeholder until the profile feature lands; shows the empty state.
export default function ProfileScreen() {
  const { t } = useTranslation();

  return (
    <Screen>
      <Text variant="title">{t('profile.title')}</Text>
      <EmptyState
        icon="person-outline"
        title={t('common.comingSoon')}
        description={t('profile.emptyDescription')}
      />
    </Screen>
  );
}
