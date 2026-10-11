import { Library } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BookCard } from '@/components/curriculum/BookCard';
import { CommandHint, EmptyState, ErrorState, LoadingState } from '@/components/ui';
import { useContentIndex } from '@/features/content/queries';
import { commands } from '@/lib/commands';

export function BooksPage() {
  const { t } = useTranslation();
  const index = useContentIndex();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-sans-black text-3xl text-foreground">{t('books.title')}</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">{t('books.subtitle')}</p>
      </header>
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
          <CommandHint command={commands.split} />
          <CommandHint command={commands.source('4.1')} />
        </EmptyState>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {index.data.books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}
