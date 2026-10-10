import { BookOpen, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import type { ContentBookEntry } from '@mytutor/types';
import { Badge } from '@/components/ui';
import { bookTitle } from '@/features/content/pages';
import { useStructure } from '@/features/content/queries';
import { DeleteBookButton } from './DeleteBookButton';

type BookCardProps = { book: ContentBookEntry };

export function BookCard({ book }: BookCardProps) {
  const { t } = useTranslation();
  const structure = useStructure(book.structure);
  const units = structure.data?.units ?? [];
  const topicCount = units.reduce(
    (n, u) => n + u.items.filter((i) => i.type === 'topic').length,
    0,
  );
  // The delete button sits beside the link, not inside it: a button within a link is invalid.
  return (
    <div className="flex min-w-0 items-center gap-1 rounded-lg border border-border bg-card pr-2 transition-colors has-[a:hover]:border-primary/60">
      <Link
        to={`/books/${encodeURIComponent(book.id)}`}
        className="group flex min-w-0 flex-1 items-center gap-4 rounded-lg p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
          <BookOpen className="size-6" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="truncate font-sans-bold text-base text-foreground">
            {bookTitle(book)}
          </span>
          <span className="truncate font-mono text-xs text-muted-foreground">{book.file}</span>
          <span className="flex flex-wrap gap-1.5 pt-1">
            {book.structure ? (
              <>
                <Badge>{t('books.units', { count: units.length })}</Badge>
                <Badge>{t('books.topics', { count: topicCount })}</Badge>
              </>
            ) : (
              <Badge tone="accent">{t('books.noStructure')}</Badge>
            )}
            <Badge tone="success">{t('books.sourcesReady', { count: book.topics.length })}</Badge>
          </span>
        </span>
        <ChevronRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </Link>
      <DeleteBookButton book={book} iconOnly />
    </div>
  );
}
