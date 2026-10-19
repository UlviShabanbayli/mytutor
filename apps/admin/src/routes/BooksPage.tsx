import { Library, Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AddBookDialog } from '@/components/books/AddBookDialog';
import { BookLane } from '@/components/books/BookLane';
import { StageLegend } from '@/components/books/StageLegend';
import { Button, CommandHint, EmptyState, ErrorState, LoadingState } from '@/components/ui';
import { usePageCrumbs } from '@/features/layout/crumbs';
import { useLibrary } from '@/features/progress/useLibrary';
import { commands } from '@/lib/commands';

export function BooksPage() {
  const { t } = useTranslation();
  usePageCrumbs([{ label: t('nav.overview'), to: '/' }, { label: t('books.title') }]);
  const { index, library } = useLibrary();
  const [adding, setAdding] = useState(false);
  const addButton = (
    <Button className="h-12 rounded-md px-4" onClick={() => setAdding(true)}>
      <Plus className="size-5" />
      {t('books.add')}
    </Button>
  );

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end gap-4">
        <div className="flex min-w-0 flex-[1_1_26rem] flex-col gap-1.5">
          <h1 className="font-sans-black text-3xl text-foreground">{t('books.title')}</h1>
          <p className="max-w-3xl text-[15px] text-muted-foreground">{t('books.subtitle')}</p>
        </div>
        {library.length ? addButton : null}
      </header>
      <AddBookDialog open={adding} onClose={() => setAdding(false)} />
      {index.isPending ? (
        <LoadingState />
      ) : index.isError ? (
        <ErrorState onRetry={() => void index.refetch()} detail={index.error.message} />
      ) : library.length === 0 ? (
        <EmptyState
          icon={<Library className="size-6" />}
          title={t('books.emptyTitle')}
          body={t('books.emptyBody')}
        >
          {addButton}
          <CommandHint command={commands.split} />
        </EmptyState>
      ) : (
        <>
          <StageLegend />
          <div className="flex flex-col gap-3">
            {library.map((item) => (
              <BookLane key={item.book.id} item={item} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
