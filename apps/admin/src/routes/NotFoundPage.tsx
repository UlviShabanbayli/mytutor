import { SearchX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { buttonClass, EmptyState } from '@/components/ui';
import { usePageCrumbs } from '@/features/layout/crumbs';

export function NotFoundPage() {
  const { t } = useTranslation();
  usePageCrumbs([{ label: t('common.notFoundTitle') }]);
  return (
    <EmptyState
      icon={<SearchX className="size-6" />}
      title={t('common.notFoundTitle')}
      body={t('common.notFoundBody')}
    >
      <Link to="/" className={buttonClass('secondary')}>
        {t('common.backHome')}
      </Link>
    </EmptyState>
  );
}
