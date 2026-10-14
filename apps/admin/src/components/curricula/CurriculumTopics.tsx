import { BookPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import type { CurriculumEntry } from '@mytutor/types';
import { buttonClass, EmptyState } from '@/components/ui';
import { addStats, bookStats } from '@/features/progress/stages';
import type { LibraryBook } from '@/features/progress/useLibrary';
import { CurriculumBookTopics } from './CurriculumBookTopics';

type CurriculumTopicsProps = { curriculum: CurriculumEntry; library: LibraryBook[] };

/**
 * The curriculum's topics are its textbooks' topics: same names, units and order, book after
 * book as the curriculum lists them. Nothing is edited here; a topic opens in its book.
 */
export function CurriculumTopics({ curriculum, library }: CurriculumTopicsProps) {
  const { t } = useTranslation();
  const books = curriculum.textbooks.map(({ bookId }) => ({
    bookId,
    item: library.find((b) => b.book.id === bookId) ?? null,
  }));

  if (books.length === 0)
    return (
      <EmptyState
        icon={<BookPlus className="size-6" />}
        title={t('curricula.noTextbooksTitle')}
        body={t('curricula.noTextbooksBody')}
      >
        <Link
          to={`/curricula/${encodeURIComponent(curriculum.id)}`}
          className={buttonClass('primary')}
        >
          {t('curricula.addTextbook')}
        </Link>
      </EmptyState>
    );

  const stats = books.reduce(
    (sum, { item }) => (item ? addStats(sum, item.stats) : sum),
    bookStats([]),
  );
  const firstBook = books.find(({ item }) => item)?.bookId;

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <p className="max-w-2xl text-sm text-muted-foreground">{t('curricula.topicsBody')}</p>
        <p className="text-sm font-sans-bold text-foreground">
          {t('curricula.topicsSummary', {
            topics: stats.topics,
            approved: stats.approved,
            items: stats.items,
          })}
        </p>
      </div>
      {books.map(({ bookId, item }) =>
        item ? (
          <CurriculumBookTopics key={bookId} item={item} firstOpen={bookId === firstBook} />
        ) : (
          <p
            key={bookId}
            className="rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground"
          >
            {bookId}: {t('curricula.bookMissing')}
          </p>
        ),
      )}
    </section>
  );
}
