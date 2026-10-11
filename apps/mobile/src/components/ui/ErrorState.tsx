import { useTranslation } from 'react-i18next';
import { EmptyState } from './EmptyState';

type ErrorStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
};

export function ErrorState({ title, description, onRetry }: ErrorStateProps) {
  const { t } = useTranslation();

  return (
    <EmptyState
      icon="cloud-offline-outline"
      title={title ?? t('common.errorTitle')}
      description={description ?? t('common.errorDescription')}
      actionLabel={onRetry ? t('common.retry') : undefined}
      onAction={onRetry}
    />
  );
}
