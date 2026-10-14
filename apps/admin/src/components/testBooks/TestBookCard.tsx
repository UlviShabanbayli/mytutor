import { ChevronRight, ClipboardList } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import type { TestBookEntry } from '@mytutor/types';
import { Badge } from '@/components/ui';
import { formatDay } from '@/features/testBooks/format';

/** One test book in the list: title, subject, pages and when it was added. */
export function TestBookCard({ book }: { book: TestBookEntry }) {
  const { t, i18n } = useTranslation();
  return (
    <Link
      to={`/test-books/${encodeURIComponent(book.id)}`}
      className="flex min-h-11 items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
        <ClipboardList className="size-5" aria-hidden />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate font-sans-bold text-base text-foreground">{book.title}</span>
        <span className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge tone="primary">{t(`subjects.${book.subject}`)}</Badge>
          {t('testBooks.pages', { count: book.pages })}
          <span aria-hidden>·</span>
          {t('testBooks.added', { date: formatDay(book.createdAt, i18n.language) })}
        </span>
      </span>
      <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden />
    </Link>
  );
}
