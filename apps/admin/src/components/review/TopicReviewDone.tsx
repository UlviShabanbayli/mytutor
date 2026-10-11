import { PartyPopper } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { buttonClass } from '@/components/ui';

type TopicReviewDoneProps = { bookId: string; topic: string };

/** Every block of the topic is approved. */
export function TopicReviewDone({ bookId, topic }: TopicReviewDoneProps) {
  const { t } = useTranslation();
  return (
    <div
      role="status"
      className="flex flex-wrap items-center gap-3 rounded-lg bg-success-muted p-4 text-success"
    >
      <PartyPopper className="size-6 shrink-0" aria-hidden />
      <span className="flex-[1_1_18rem] font-sans-black text-base">
        {t('review.topicDone', { topic })}
      </span>
      <Link to={`/books/${encodeURIComponent(bookId)}`} className={buttonClass('primary')}>
        {t('review.backToBook')}
      </Link>
    </div>
  );
}
