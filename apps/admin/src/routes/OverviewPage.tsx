import { Library, Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AddBookDialog } from '@/components/books/AddBookDialog';
import { BookLane } from '@/components/books/BookLane';
import { StageLegend } from '@/components/books/StageLegend';
import { NextSteps } from '@/components/overview/NextSteps';
import { StepStrip } from '@/components/overview/StepStrip';
import { Button, EmptyState, ErrorState, LoadingState } from '@/components/ui';
import { linkCount } from '@/features/curriculum/links';
import { usePageCrumbs } from '@/features/layout/crumbs';
import { addStats, bookStats } from '@/features/progress/stages';
import { useLibrary } from '@/features/progress/useLibrary';

/** The five steps across all books, the next thing to do, and every book's progress. */
export function OverviewPage() {
  const { t } = useTranslation();
  usePageCrumbs([{ label: t('nav.overview') }]);
  const { index, library } = useLibrary();
  const [adding, setAdding] = useState(false);

  if (index.isPending) return <LoadingState />;
  if (index.isError)
    return <ErrorState onRetry={() => void index.refetch()} detail={index.error.message} />;
  const stats = library.map((b) => b.stats).reduce(addStats, bookStats([]));
  const links = index.data.books.reduce(
    (sum, b) => sum + (b.curriculumLinks ? linkCount(b.curriculumLinks) : 0),
    0,
  );
  const addButton = (
    <Button className="h-12 rounded-md px-4" onClick={() => setAdding(true)}>
      <Plus className="size-5" />
      {t('books.add')}
    </Button>
  );

  return (
    <div className="flex flex-col gap-7">
      <header className="flex flex-wrap items-end gap-4">
        <div className="flex min-w-0 flex-[1_1_26rem] flex-col gap-1.5">
          <h1 className="font-sans-black text-3xl text-foreground">{t('overview.title')}</h1>
          <p className="max-w-2xl text-[15px] text-muted-foreground">{t('overview.subtitle')}</p>
        </div>
        {addButton}
      </header>
      <AddBookDialog open={adding} onClose={() => setAdding(false)} />
      {library.length === 0 ? (
        <EmptyState
          icon={<Library className="size-6" />}
          title={t('books.emptyTitle')}
          body={t('books.emptyBody')}
        >
          {addButton}
        </EmptyState>
      ) : (
        <>
          <StepStrip stats={stats} links={links} curricula={index.data.curricula.length} />
          <NextSteps library={library} curricula={index.data.curricula} />
          <section aria-labelledby="books-lanes" className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <h2 id="books-lanes" className="flex-1 font-sans-black text-lg text-foreground">
                {t('nav.books')}
              </h2>
              <StageLegend />
            </div>
            {library.map((item) => (
              <BookLane key={item.book.id} item={item} />
            ))}
          </section>
        </>
      )}
    </div>
  );
}
