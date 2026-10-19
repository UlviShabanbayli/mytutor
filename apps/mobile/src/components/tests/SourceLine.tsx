import { useTranslation } from 'react-i18next';
import type { SourceRef } from '@mytutor/types';
import { SourceLine as SourceLineUi } from '@/components/ui';

type SourceLineProps = {
  source: SourceRef;
};

/** "Mənbə: Test bankı · Riyaziyyat, 7-ci sinif · Natural ədədlər · səh. 45" */
export function SourceLine({ source }: SourceLineProps) {
  const { t } = useTranslation();
  const parts = [
    t(`source.${source.kind}`),
    source.title,
    source.grade ? t('common.grade', { count: source.grade, ordinal: true }) : null,
    source.section ?? null,
    source.page ? t('source.page', { page: source.page }) : null,
  ].filter(Boolean);

  return <SourceLineUi source={parts.join(' · ')} />;
}
