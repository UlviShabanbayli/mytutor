import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { buttonClass } from '@/components/ui';
import type { TopicRowData } from '@/features/progress/stages';
import { ExtractSourceButton } from './ExtractSourceButton';

type TopicActionProps = { bookId: string; topic: TopicRowData; canExtract: boolean };

/** The one thing to do with a topic now, named plainly. */
export function TopicAction({ bookId, topic, canExtract }: TopicActionProps) {
  const { t } = useTranslation();
  const base = `/books/${encodeURIComponent(bookId)}/topics/${encodeURIComponent(topic.number)}`;
  const small = 'min-h-10 whitespace-nowrap rounded-sm px-3.5 text-[13px]';
  switch (topic.stage) {
    case 'none':
      return canExtract ? (
        <ExtractSourceButton bookId={bookId} topic={topic.number} />
      ) : (
        <span className="text-xs text-muted-foreground">{t('bookPage.noPdfShort')}</span>
      );
    case 'source':
      return (
        <Link to={`${base}/source`} className={buttonClass('secondary', small)}>
          {t('bookPage.openSource')}
        </Link>
      );
    case 'knowledge':
      return (
        <Link to={`${base}/review`} className={buttonClass('secondary', small)}>
          {t('bookPage.startReview')}
        </Link>
      );
    case 'review':
      return (
        <Link to={`${base}/review`} className={buttonClass('primary', small)}>
          {t('bookPage.continueReview')}
        </Link>
      );
    case 'approved':
      return (
        <Link to={`${base}/review`} className={buttonClass('ghost', small)}>
          {t('bookPage.viewReview')}
        </Link>
      );
  }
}
