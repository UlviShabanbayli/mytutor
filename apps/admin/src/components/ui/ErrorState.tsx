import { TriangleAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from './Button';
import { EmptyState } from './EmptyState';

type ErrorStateProps = { onRetry?: () => void; detail?: string };

export function ErrorState({ onRetry, detail }: ErrorStateProps) {
  const { t } = useTranslation();
  return (
    <EmptyState
      icon={<TriangleAlert className="size-6" />}
      title={t('common.errorTitle')}
      body={t('common.errorBody')}
    >
      {detail ? <code className="font-mono text-xs text-muted-foreground">{detail}</code> : null}
      {onRetry ? (
        <Button variant="secondary" onClick={onRetry}>
          {t('common.retry')}
        </Button>
      ) : null}
    </EmptyState>
  );
}
