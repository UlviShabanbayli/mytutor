import { useTranslation } from 'react-i18next';
import { EmptyState } from './EmptyState';

type ErrorStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
};

/** Full-screen error: the mascot offline moment, the plain reason and a retry. */
export function ErrorState({ title, description, onRetry }: ErrorStateProps) {
  const { t } = useTranslation();

  return (
    <EmptyState
      moment="offline"
      title={title ?? t('common.errorTitle')}
      description={description ?? t('common.errorDescription')}
      actionLabel={onRetry ? t('common.retry') : undefined}
      onAction={onRetry}
    />
  );
}
