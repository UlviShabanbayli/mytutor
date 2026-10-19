import type { ReactNode } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui';

type QueryViewProps<T> = {
  query: UseQueryResult<T>;
  children: (data: T) => ReactNode;
  /** Replaces the default flying-mascot wait (the report draws a skeleton). */
  loading?: ReactNode;
};

/**
 * The data of a query, or its loading, error or offline state. Data that is already here stays
 * on screen while a refresh fails or waits for the network.
 */
export function QueryView<T>({ query, children, loading }: QueryViewProps<T>) {
  const { t } = useTranslation();

  if (query.data !== undefined) return <>{children(query.data)}</>;
  if (query.isError) return <ErrorState onRetry={() => void query.refetch()} />;
  if (query.fetchStatus === 'paused') {
    return (
      <EmptyState
        moment="offline"
        title={t('parent.state.offlineTitle')}
        description={t('parent.state.offlineBody')}
      />
    );
  }
  return <>{loading ?? <LoadingState />}</>;
}
