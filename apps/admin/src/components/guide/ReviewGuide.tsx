import { Check, Columns2, Maximize2, MessageSquareWarning, Pencil, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui';
import { GuideSection } from './GuideSection';
import { SampleButton } from './samples';

export function ReviewGuide() {
  const { t } = useTranslation();
  return (
    <GuideSection
      id="review"
      title={t('guide.review.title')}
      intro={t('guide.review.intro')}
      rows={[
        {
          sample: (
            <span className="flex items-center gap-2 text-xs">
              <Check className="size-4 text-success" />
              <span className="size-4 rounded-full border-2 border-primary" />
              <span className="size-4 rounded-full border-2 border-border" />
              <span className="font-sans-black text-destructive">
                {t('review.problems', { count: 1 })}
              </span>
            </span>
          ),
          text: t('guide.review.pageList'),
        },
        {
          sample: <Badge tone="accent">{t('review.flagged')}</Badge>,
          text: t('guide.review.flagged'),
        },
        {
          sample: (
            <Badge tone="neutral" icon={<Columns2 className="size-3" />}>
              {t('review.compare')}
            </Badge>
          ),
          text: t('guide.review.compare'),
        },
        {
          sample: (
            <SampleButton variant="primary">
              <Check className="size-3.5" />
              {t('review.approve')}
            </SampleButton>
          ),
          text: t('guide.review.approve'),
        },
        {
          sample: (
            <SampleButton>
              <Pencil className="size-3.5" />
              {t('review.correct')}
            </SampleButton>
          ),
          text: t('guide.review.correct'),
        },
        {
          sample: (
            <SampleButton variant="ghost">
              <MessageSquareWarning className="size-3.5" />
              {t('review.needsFix')}
            </SampleButton>
          ),
          text: t('guide.review.needsFix'),
        },
        {
          sample: (
            <SampleButton>
              <Maximize2 className="size-3.5" />
              {t('review.zoom')}
            </SampleButton>
          ),
          text: t('guide.review.zoom'),
        },
        {
          sample: (
            <SampleButton>
              <span className="flex items-center gap-1 text-destructive">
                <X className="size-3.5" />
                {t('review.reject')}
              </span>
            </SampleButton>
          ),
          text: t('guide.review.reject'),
        },
        { sample: <SampleButton>{t('review.undo')}</SampleButton>, text: t('guide.review.undo') },
        {
          sample: <SampleButton>{t('review.approveClean', { count: 5 })}</SampleButton>,
          text: t('guide.review.approveClean'),
        },
        { sample: <SampleButton>{t('review.later')}</SampleButton>, text: t('guide.review.later') },
        {
          sample: (
            <SampleButton variant="primary">{t('review.approveBlock', { count: 2 })}</SampleButton>
          ),
          text: t('guide.review.approveBlock'),
        },
        {
          sample: (
            <span className="flex items-center gap-1.5 rounded-sm bg-success-muted px-2 py-1 text-xs font-sans-black text-success">
              <Check className="size-3.5" />
              {t('review.blockDone', { id: 'b19' })}
            </span>
          ),
          text: t('guide.review.done'),
        },
      ]}
    />
  );
}
