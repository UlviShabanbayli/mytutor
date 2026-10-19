import { ClipboardList, ListTree, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { TestBookFacts } from '@/components/testBooks/TestBookFacts';
import { TestBookQuestions } from '@/components/testBooks/TestBookQuestions';
import { DeleteTestBookDialog } from '@/components/testBooks/DeleteTestBookDialog';
import { Badge, Button, EmptyState, ErrorState, LoadingState } from '@/components/ui';
import { useContentIndex } from '@/features/content/queries';
import { usePageCrumbs } from '@/features/layout/crumbs';
import { NotFoundPage } from './NotFoundPage';

/** One test book: what was added, and what happens to it next. */
export function TestBookPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { testBookId = '' } = useParams();
  const index = useContentIndex();
  const [deleting, setDeleting] = useState(false);
  const book = index.data?.testBooks.find((b) => b.id === testBookId) ?? null;
  usePageCrumbs([
    { label: t('nav.overview'), to: '/' },
    { label: t('testBooks.title'), to: '/test-books' },
    { label: book?.title ?? '…' },
  ]);

  if (index.isPending) return <LoadingState />;
  if (index.isError) return <ErrorState onRetry={() => void index.refetch()} />;
  if (!book) return <NotFoundPage />;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start gap-4">
        <div className="flex min-w-0 flex-[1_1_26rem] flex-col gap-2">
          <Badge tone="primary" className="self-start">
            {t(`subjects.${book.subject}`)}
          </Badge>
          <h1 className="flex items-center gap-3 font-sans-black text-3xl text-foreground">
            <ClipboardList className="size-7 shrink-0 text-primary" aria-hidden />
            {book.title}
          </h1>
        </div>
        <Button variant="ghost" onClick={() => setDeleting(true)}>
          <Trash2 className="size-4" />
          {t('testBooks.delete')}
        </Button>
      </header>
      <TestBookFacts book={book} />
      {book.questions ? (
        <TestBookQuestions book={book} questions={book.questions} />
      ) : (
        <EmptyState
          icon={<ListTree className="size-6" />}
          title={t('testBooks.nextTitle')}
          body={t('testBooks.nextBody')}
        />
      )}
      <DeleteTestBookDialog
        book={book}
        open={deleting}
        onClose={() => setDeleting(false)}
        onDeleted={() => void navigate('/test-books')}
      />
    </div>
  );
}
