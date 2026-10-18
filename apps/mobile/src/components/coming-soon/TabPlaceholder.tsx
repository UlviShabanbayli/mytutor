import { useTranslation } from 'react-i18next';
import { EmptyState, Screen, Text } from '@/components/ui';

type TabPlaceholderProps = {
  title: string;
};

/** A tab whose area is not built yet: its title and a calm "coming soon". */
export function TabPlaceholder({ title }: TabPlaceholderProps) {
  const { t } = useTranslation();

  return (
    <Screen>
      <Text variant="title">{title}</Text>
      <EmptyState moment="aiThinking" title={t('common.comingSoon')} />
    </Screen>
  );
}
