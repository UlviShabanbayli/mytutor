import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { KnowledgeMissing } from '@/components/knowledge/KnowledgeMissing';
import { ReviewWorkspace } from '@/components/review/ReviewWorkspace';
import { ErrorState, LoadingState } from '@/components/ui';
import { bookTitle } from '@/features/content/pages';
import { useBook, useKnowledge, useTopicSource } from '@/features/content/queries';
import { useBookStandards } from '@/features/standards/useBookStandards';
import { usePageCrumbs } from '@/features/layout/crumbs';
import { useReviewActions, useTopicReview } from '@/features/review/useTopicReview';
import { NotFoundPage } from './NotFoundPage';

/** Block-by-block review of one topic's knowledge items against the textbook. */
export function ReviewPage() {
  const { t } = useTranslation();
  const { bookId = '', number = '' } = useParams();
  const book = useBook(bookId);
  const entry = book.data?.topics.find((topic) => topic.number === number) ?? null;
  const source = useTopicSource(entry?.source ?? null);
  const knowledge = useKnowledge(entry?.knowledge ?? null);
  const review = useTopicReview(bookId, entry);
  const actions = useReviewActions(bookId, number);
  const bs = useBookStandards(book.data);
  const bookUrl = `/books/${encodeURIComponent(bookId)}`;
  usePageCrumbs([
    { label: t('nav.overview'), to: '/' },
    { label: book.data ? bookTitle(book.data) : t('nav.books'), to: bookUrl },
    { label: t('review.crumb', { number }) },
  ]);

  if (book.isPending) return <LoadingState />;
  if (book.isError) return <ErrorState onRetry={() => void book.refetch()} />;
  if (!book.data || !entry) return <NotFoundPage />;
  if (!entry.knowledge) return <KnowledgeMissing topicDir={entry.dir} />;
  const failed = [source, knowledge, review].find((q) => q.isError);
  if (failed)
    return <ErrorState onRetry={() => void failed.refetch()} detail={failed.error?.message} />;
  if (!source.data || !knowledge.data || review.isPending) return <LoadingState />;

  return (
    <ReviewWorkspace
      bookId={bookId}
      topic={number}
      topicDir={entry.dir}
      source={source.data}
      doc={knowledge.data}
      review={review.data ?? null}
      actions={actions}
      bs={bs}
    />
  );
}
