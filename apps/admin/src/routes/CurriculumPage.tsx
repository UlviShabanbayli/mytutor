import { ListTree } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { DeleteBookButton } from '@/components/curriculum/DeleteBookButton';
import { UnitSection } from '@/components/curriculum/UnitSection';
import { Breadcrumbs, CommandHint, EmptyState, ErrorState, LoadingState } from '@/components/ui';
import { bookTitle } from '@/features/content/pages';
import { useBook, useStructure } from '@/features/content/queries';
import { commands } from '@/lib/commands';
import { NotFoundPage } from './NotFoundPage';

export function CurriculumPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { bookId = '' } = useParams();
  const book = useBook(bookId);
  const structure = useStructure(book.data?.structure ?? null);

  if (book.isPending) return <LoadingState />;
  if (book.isError) return <ErrorState onRetry={() => void book.refetch()} />;
  if (!book.data) return <NotFoundPage />;
  const entry = book.data;

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs items={[{ label: t('books.title'), to: '/' }, { label: bookTitle(entry) }]} />
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="font-sans-black text-3xl text-foreground">{bookTitle(entry)}</h1>
          <p className="break-all font-mono text-xs text-muted-foreground">{entry.file}</p>
        </div>
        <DeleteBookButton book={entry} onDeleted={() => void navigate('/')} />
      </header>
      {!entry.structure ? (
        <EmptyState
          icon={<ListTree className="size-6" />}
          title={t('curriculum.noStructureTitle')}
          body={t('curriculum.noStructureBody')}
        >
          <CommandHint command={commands.split} />
        </EmptyState>
      ) : structure.isPending ? (
        <LoadingState />
      ) : structure.isError ? (
        <ErrorState onRetry={() => void structure.refetch()} detail={structure.error.message} />
      ) : (
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
      )}
    </div>
  );
}
