import { SearchX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { buttonClass, EmptyState } from '@/components/ui';

export function NotFoundPage() {
  const { t } = useTranslation();
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
