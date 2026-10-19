import { useTranslation } from 'react-i18next';
import type { SourceRef } from '@mytutor/types';
import { SourceLine as SourceLineUi } from '@/components/ui';

type SourceLineProps = {
  /** A question's source, or an already written line ("Riyaziyyat 7 (TRİMS), 1-ci hissə · 4.3"). */
  source: SourceRef | string;
  className?: string;
};

/** "Mənbə: Test bankı · Riyaziyyat, 7-ci sinif · Natural ədədlər · səh. 45" */
export function SourceLine({ source, className }: SourceLineProps) {
  const { t } = useTranslation();
  if (typeof source === 'string') return <SourceLineUi source={source} className={className} />;
  const parts = [
    t(`source.${source.kind}`),
    source.title,
    source.grade ? t('common.grade', { count: source.grade, ordinal: true }) : null,
    source.section ?? null,
    source.page ? t('source.page', { page: source.page }) : null,
  ].filter(Boolean);

  return <SourceLineUi source={parts.join(' · ')} className={className} />;
}
