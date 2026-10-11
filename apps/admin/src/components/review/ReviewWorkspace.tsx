import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { KnowledgeDocument, TopicReview, TopicSource } from '@mytutor/types';
import { ActionError } from '@/components/books/ActionError';
import { ItemStandards } from '@/components/links/ItemStandards';
import { nextOpenBlock, reviewQueue } from '@/features/review/queue';
import type { ReviewActions } from '@/features/review/useTopicReview';
import type { BookCurriculum } from '@/features/curriculum/useBookCurriculum';
import { useSearchParam } from '@/lib/useSearchParam';
import { BlockCard } from './BlockCard';
import { PagePanel } from './PagePanel';
import { ReviewHeader } from './ReviewHeader';
import { ReviewHelp } from './ReviewHelp';
import { TopicReviewDone } from './TopicReviewDone';

type ReviewWorkspaceProps = {
  bookId: string;
  topic: string;
  topicDir: string;
  source: TopicSource;
  doc: KnowledgeDocument;
  review: TopicReview | null;
  actions: ReviewActions;
  bc: BookCurriculum;
};

/** The page on the left, the current block and its items on the right, the queue below. */
export function ReviewWorkspace({
  bookId,
  topic,
  topicDir,
  source,
  doc,
  review,
  actions,
  bc,
}: ReviewWorkspaceProps) {
  const { t } = useTranslation();
  const [blockParam, setParams] = useSearchParam('block');
  const { queue, decisions } = useMemo(
    () => reviewQueue(source, doc.items, review),
    [source, doc.items, review],
  );
  const current =
    queue.find((b) => b.id === blockParam) ?? queue.find((b) => !b.approved) ?? queue[0];
  const next = current ? nextOpenBlock(queue, current.id) : null;
  const select = (id: string) => setParams({ block: id });
  // Keeps the block in the URL, so it stays on screen (with "undo" and "next") once approved.
  useEffect(() => {
    if (!blockParam && current) setParams({ block: current.id });
  }, [blockParam, current, setParams]);
  const approvedCount = queue.filter((b) => b.approved).length;
  const curriculum = bc.curriculum;
  const upcoming = queue.filter((b) => !b.approved && b.id !== current?.id).slice(0, 2);

  return (
    <div className="flex flex-col gap-4">
      <ReviewHeader
        exitTo={`/books/${encodeURIComponent(bookId)}`}
        unit={`${t('bookPage.unit', { index: source.topic.unit.index })} · ${source.topic.unit.title}`}
        title={`${topic}. ${source.topic.title}`}
        blocks={{ done: approvedCount, total: queue.length }}
        items={{ done: decisions.size, total: doc.items.length }}
      />
      <ReviewHelp />
      {actions.save.isError ? <ActionError error={actions.save.error} /> : null}
      {queue.length > 0 && approvedCount === queue.length ? (
        <TopicReviewDone bookId={bookId} topic={topic} />
      ) : null}
      {current ? (
        <div className="flex flex-wrap items-start gap-4">
          <div className="min-w-0 flex-[1_1_16rem] lg:sticky lg:top-20 lg:max-w-sm">
            <PagePanel
              key={current.id}
              source={source}
              topicDir={topicDir}
              queue={queue}
              current={current.id}
              onSelect={select}
            />
          </div>
          <div className="flex min-w-0 flex-[999_1_32rem] flex-col gap-2.5">
            <BlockCard
              key={current.id}
              entry={current}
              source={source}
              topicDir={topicDir}
              decisions={decisions}
              actions={actions}
              next={next?.id ?? null}
              onNext={() => next && select(next.id)}
              itemStandards={
                curriculum
                  ? (item) => (
                      <ItemStandards
                        topic={topic}
                        item={item}
                        items={doc.items}
                        codes={
                          bc.links.items.find((l) => l.topic === topic && l.itemId === item.id)
                            ?.codes ?? []
                        }
                        curriculum={curriculum}
                        bc={bc}
                      />
                    )
                  : undefined
              }
            />
            {upcoming.length ? (
              <p className="rounded-md border border-border bg-card px-3.5 py-3 text-[13px] text-muted-foreground">
                {t('review.upcoming')}{' '}
                {upcoming.map((b, i) => (
                  <span key={b.id}>
                    {i > 0 ? `, ${t('review.then')} ` : ''}
                    <strong className="font-sans-black text-foreground">{b.id}</strong>{' '}
                    {t('review.upcomingItems', { count: b.items.length })}
                    {b.problems ? ` · ${t('review.problems', { count: b.problems })}` : ''}
                  </span>
                ))}
              </p>
            ) : null}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{t('review.empty')}</p>
      )}
    </div>
  );
}
