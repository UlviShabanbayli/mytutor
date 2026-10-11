import { Library, Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AddBookDialog } from '@/components/curriculum/AddBookDialog';
import { BookCard } from '@/components/curriculum/BookCard';
import { DeletedBooks } from '@/components/curriculum/DeletedBooks';
import { Button, CommandHint, EmptyState, ErrorState, LoadingState } from '@/components/ui';
import { useContentIndex } from '@/features/content/queries';
import { commands } from '@/lib/commands';

export function BooksPage() {
  const { t } = useTranslation();
  const index = useContentIndex();
  const [adding, setAdding] = useState(false);
  const addButton = (
    <Button onClick={() => setAdding(true)}>
      <Plus className="size-4" />
      {t('books.add')}
    </Button>
  );

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="font-sans-black text-3xl text-foreground">{t('books.title')}</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">{t('books.subtitle')}</p>
        </div>
        {index.data?.books.length ? addButton : null}
      </header>
      <AddBookDialog open={adding} onClose={() => setAdding(false)} />
      {index.isPending ? (
        <LoadingState />
      ) : index.isError ? (
        <ErrorState onRetry={() => void index.refetch()} detail={index.error.message} />
      ) : index.data.books.length === 0 ? (
        <EmptyState
          icon={<Library className="size-6" />}
          title={t('books.emptyTitle')}
          body={t('books.emptyBody')}
        >
          {addButton}
          <CommandHint command={commands.split} />
        </EmptyState>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {index.data.books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
      {index.data ? <DeletedBooks entries={index.data.trash} /> : null}
    </div>
  );
}
