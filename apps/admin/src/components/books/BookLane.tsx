import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { buttonClass } from '@/components/ui';
import { bookTitle } from '@/features/content/pages';
import { missingSources } from '@/features/progress/stages';
import type { LibraryBook } from '@/features/progress/useLibrary';
import { BookSpine } from './BookSpine';
import { ExtractMissingButton } from './ExtractMissingButton';
import { TopicCells } from './TopicCells';

type BookLaneProps = { item: LibraryBook };

/** A book with a cell per topic: what is done, what waits, and the next action. */
export function BookLane({ item }: BookLaneProps) {
  const { t } = useTranslation();
  const { book, units, stats } = item;
  const url = `/books/${encodeURIComponent(book.id)}`;
  const missing = missingSources(item.topics).map((topic) => topic.number);
  const title = bookTitle(book);

  return (
    <article className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card px-4 py-4 sm:px-5">
      <div className="flex min-w-0 flex-[1_1_16rem] items-center gap-3">
        <BookSpine title={title} strong={stats.openFlagged > 0} />
        <div className="flex min-w-0 flex-col gap-0.5">
          <Link
            to={url}
            className="truncate font-sans-black text-[15px] text-foreground hover:underline"
          >
            {title}
          </Link>
          <span className="text-[13px] text-muted-foreground">
            {t('books.topics', { count: stats.topics })}
            {stats.openFlagged ? (
              <span className="font-sans-bold text-destructive">
                {' · '}
                {t('stage.flaggedCount', { count: stats.openFlagged })}
              </span>
            ) : missing.length ? (
              <span className="font-sans-bold text-foreground">
                {' · '}
                {t('books.withoutSource', { count: missing.length })}
              </span>
            ) : null}
          </span>
        </div>
      </div>
      <div className="min-w-0 flex-[3_1_32rem]">
        {units.length ? (
          <TopicCells bookId={book.id} units={units} />
        ) : (
          <p className="text-sm text-muted-foreground">{t('books.noStructure')}</p>
        )}
      </div>
      {missing.length > stats.topics / 2 && book.canExtract ? (
        <ExtractMissingButton book={book} topics={missing} />
      ) : (
        <Link to={url} className={buttonClass('secondary')}>
          {t('books.open')}
        </Link>
      )}
    </article>
  );
}
