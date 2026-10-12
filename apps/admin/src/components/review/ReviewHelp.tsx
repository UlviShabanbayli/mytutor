import { Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui';
import { useReviewHelp } from '@/features/review/helpStore';

/** How the review works, until the editor says they got it. */
export function ReviewHelp() {
  const { t } = useTranslation();
  const hidden = useReviewHelp((s) => s.hidden);
  const hide = useReviewHelp((s) => s.hide);
  if (hidden) return null;
  return (
    <div
      role="note"
      className="flex flex-wrap items-center gap-3 rounded-md bg-secondary px-4 py-3 text-sm leading-relaxed text-secondary-foreground"
    >
      <Info className="size-5 shrink-0" aria-hidden />
      <p className="min-w-0 flex-[1_1_24rem]">
        <strong className="font-sans-black">{t('review.helpTitle')}</strong> {t('review.helpBody')}
      </p>
      <Button variant="secondary" className="min-h-9" onClick={hide}>
        {t('review.helpOk')}
      </Button>
    </div>
  );
}
