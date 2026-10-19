import { Inbox } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { buttonClass, EmptyState, ErrorState, LoadingState } from '@/components/ui';
import { bookTitle } from '@/features/content/pages';
import { usePageCrumbs } from '@/features/layout/crumbs';
import { useLibrary } from '@/features/progress/useLibrary';

/** Every topic waiting for review or under review, started ones first. */
export function ReviewQueuePage() {
  const { t } = useTranslation();
  usePageCrumbs([{ label: t('nav.overview'), to: '/' }, { label: t('nav.review') }]);
  const { index, library } = useLibrary();
  if (index.isPending) return <LoadingState />;
  if (index.isError)
    return <ErrorState onRetry={() => void index.refetch()} detail={index.error.message} />;
  const rows = library
    .flatMap(({ book, topics }) =>
      topics
        .filter((topic) => topic.stage === 'review' || topic.stage === 'knowledge')
        .map((topic) => ({ book, topic })),
    )
    .sort((a, b) => Number(b.topic.stage === 'review') - Number(a.topic.stage === 'review'));

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1.5">
        <h1 className="font-sans-black text-3xl text-foreground">{t('reviewQueue.title')}</h1>
        <p className="max-w-3xl text-[15px] text-muted-foreground">{t('reviewQueue.subtitle')}</p>
      </header>
      {rows.length === 0 ? (
        <EmptyState
          icon={<Inbox className="size-6" />}
          title={t('reviewQueue.emptyTitle')}
          body={t('reviewQueue.emptyBody')}
        />
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border bg-card">
          {rows.map(({ book, topic }) => {
            const review = topic.entry?.review;
            const started = topic.stage === 'review';
            const percent = review?.blocks
              ? Math.round((review.approvedBlocks / review.blocks) * 100)
              : 0;
            return (
              <li
                key={`${book.id}-${topic.number}`}
                className="flex flex-wrap items-center gap-4 px-4 py-3"
              >
                <span className="inline-flex h-[30px] min-w-10 items-center justify-center rounded-[8px] bg-secondary px-1.5 font-sans-black text-[13px] text-secondary-foreground">
                  {topic.number}
                </span>
                <span className="flex min-w-0 flex-[1_1_16rem] flex-col">
                  <span className="truncate font-sans-bold text-sm text-foreground">
                    {topic.title}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">{bookTitle(book)}</span>
                </span>
                <span className="flex w-40 flex-col gap-1">
                  <span className="text-xs font-sans-bold text-muted-foreground">
                    {t('review.blocks', {
                      done: review?.approvedBlocks ?? 0,
                      total: review?.blocks ?? 0,
                    })}
                  </span>
                  <span className="h-1.5 rounded-full bg-border">
                    <span
                      className="block h-1.5 rounded-full bg-primary"
                      style={{ width: `${percent}%` }}
                    />
                  </span>
                </span>
                <span
                  className={`w-28 text-right text-sm tabular-nums ${review?.openFlagged ? 'font-sans-black text-destructive' : 'text-muted-foreground'}`}
                >
                  {review?.openFlagged
                    ? t('stage.flaggedCount', { count: review.openFlagged })
                    : '—'}
                </span>
                <Link
                  to={`/books/${encodeURIComponent(book.id)}/topics/${encodeURIComponent(topic.number)}/review`}
                  className={buttonClass(
                    started ? 'primary' : 'secondary',
                    'min-h-10 rounded-sm px-3.5 text-[13px]',
                  )}
                >
                  {t(started ? 'bookPage.continueReview' : 'bookPage.startReview')}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
