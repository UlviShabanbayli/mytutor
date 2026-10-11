import { ListChecks, ListTree } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { DeleteBookButton } from '@/components/books/DeleteBookButton';
import { UnitSection } from '@/components/books/UnitSection';
import { BookCurriculumTab } from '@/components/links/BookCurriculumTab';
import {
  Breadcrumbs,
  CommandHint,
  EmptyState,
  ErrorState,
  LoadingState,
  TabNav,
} from '@/components/ui';
import { bookTitle } from '@/features/content/pages';
import { useBook, useStructure } from '@/features/content/queries';
import { commands } from '@/lib/commands';
import { NotFoundPage } from './NotFoundPage';

type BookPageProps = { tab: 'topics' | 'curriculum' };

/** A book: its units and topics, or its links to a curriculum. */
export function BookPage({ tab }: BookPageProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { bookId = '' } = useParams();
  const book = useBook(bookId);
  const structure = useStructure(book.data?.structure ?? null);

  if (book.isPending) return <LoadingState />;
  if (book.isError) return <ErrorState onRetry={() => void book.refetch()} />;
  if (!book.data) return <NotFoundPage />;
  const entry = book.data;
  const base = `/books/${encodeURIComponent(entry.id)}`;

  const content = () => {
    if (!entry.structure)
      return (
        <EmptyState
          icon={<ListTree className="size-6" />}
          title={t('bookPage.noStructureTitle')}
          body={t('bookPage.noStructureBody')}
        >
          <CommandHint command={commands.split} />
        </EmptyState>
      );
    if (structure.isPending) return <LoadingState />;
    if (structure.isError)
      return (
        <ErrorState onRetry={() => void structure.refetch()} detail={structure.error.message} />
      );
    if (tab === 'curriculum') return <BookCurriculumTab book={entry} structure={structure.data} />;
    return (
      <div className="flex flex-col gap-4">
        {structure.data.units.map((unit) => (
          <UnitSection
            key={unit.index}
            bookId={entry.id}
            unit={unit}
            offset={structure.data.source.printedPageOffset}
            topics={entry.topics}
            canExtract={entry.canExtract}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs items={[{ label: t('books.title'), to: '/' }, { label: bookTitle(entry) }]} />
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="font-sans-black text-3xl text-foreground">{bookTitle(entry)}</h1>
          <p className="break-all font-mono text-xs text-muted-foreground">{entry.file}</p>
        </div>
        {/* Replaces the history entry, so Back never lands on the deleted book's page. */}
        <DeleteBookButton book={entry} onDeleted={() => void navigate('/', { replace: true })} />
      </header>
      <TabNav
        label={bookTitle(entry)}
        tabs={[
          {
            to: base,
            end: true,
            label: t('bookPage.tabs.topics'),
            icon: <ListTree className="size-4" />,
          },
          {
            to: `${base}/curriculum`,
            label: t('bookPage.tabs.curriculum'),
            icon: <ListChecks className="size-4" />,
          },
        ]}
      />
      {content()}
    </div>
  );
}
