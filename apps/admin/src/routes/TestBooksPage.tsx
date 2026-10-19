import { ClipboardList, Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AddTestBookDialog } from '@/components/testBooks/AddTestBookDialog';
import { TestBookCard } from '@/components/testBooks/TestBookCard';
import { Button, EmptyState, ErrorState, LoadingState } from '@/components/ui';
import { useContentIndex } from '@/features/content/queries';
import { usePageCrumbs } from '@/features/layout/crumbs';

/** Books of tests only, apart from the textbooks: questions are split from these. */
export function TestBooksPage() {
  const { t } = useTranslation();
  usePageCrumbs([{ label: t('nav.overview'), to: '/' }, { label: t('testBooks.title') }]);
  const index = useContentIndex();
  const [adding, setAdding] = useState(false);
  const books = index.data?.testBooks ?? [];
  const addButton = (
    <Button className="h-12 rounded-md px-4" onClick={() => setAdding(true)}>
      <Plus className="size-5" />
      {t('testBooks.add')}
    </Button>
  );

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end gap-4">
        <div className="flex min-w-0 flex-[1_1_26rem] flex-col gap-1.5">
          <h1 className="font-sans-black text-3xl text-foreground">{t('testBooks.title')}</h1>
          <p className="max-w-3xl text-[15px] text-muted-foreground">{t('testBooks.subtitle')}</p>
        </div>
        {books.length ? addButton : null}
      </header>
      <AddTestBookDialog open={adding} onClose={() => setAdding(false)} />
      {index.isPending ? (
        <LoadingState />
      ) : index.isError ? (
        <ErrorState onRetry={() => void index.refetch()} detail={index.error.message} />
      ) : books.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="size-6" />}
          title={t('testBooks.emptyTitle')}
          body={t('testBooks.emptyBody')}
        >
          {addButton}
        </EmptyState>
      ) : (
        <div className="flex flex-col gap-3">
          {books.map((book) => (
            <TestBookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}
