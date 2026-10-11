import { BookPlus, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import type { CurriculumEntry } from '@mytutor/types';
import { ActionError } from '@/components/books/ActionError';
import { BookSpine } from '@/components/books/BookSpine';
import { Button, EmptyState } from '@/components/ui';
import { bookTitle } from '@/features/content/pages';
import { useCurriculumTextbook } from '@/features/curricula/mutations';
import type { LibraryBook } from '@/features/progress/useLibrary';
import { AddTextbookDialog } from './AddTextbookDialog';

type CurriculumTextbooksProps = { curriculum: CurriculumEntry; library: LibraryBook[] };

/** The textbooks the curriculum draws on; the books themselves stay in the library. */
export function CurriculumTextbooks({ curriculum, library }: CurriculumTextbooksProps) {
  const { t } = useTranslation();
  const change = useCurriculumTextbook(curriculum.id);
  const [adding, setAdding] = useState(false);
  const addButton = (
    <Button onClick={() => setAdding(true)}>
      <BookPlus className="size-4" />
      {t('curricula.addTextbook')}
    </Button>
  );

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-muted-foreground">{t('curricula.textbooksBody')}</p>
        {curriculum.textbooks.length ? addButton : null}
      </div>
      {change.isError ? <ActionError error={change.error} /> : null}
      {curriculum.textbooks.length === 0 ? (
        <EmptyState
          icon={<BookPlus className="size-6" />}
          title={t('curricula.noTextbooksTitle')}
          body={t('curricula.noTextbooksBody')}
        >
          {addButton}
        </EmptyState>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border bg-card">
          {curriculum.textbooks.map(({ bookId }) => {
            const item = library.find((b) => b.book.id === bookId);
            const title = item ? bookTitle(item.book) : bookId;
            return (
              <li key={bookId} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <BookSpine title={title} />
                <div className="flex min-w-0 flex-[1_1_16rem] flex-col gap-0.5">
                  {item ? (
                    <Link
                      to={`/books/${encodeURIComponent(bookId)}`}
                      className="truncate font-sans-black text-[15px] text-foreground hover:underline"
                    >
                      {title}
                    </Link>
                  ) : (
                    <span className="truncate font-sans-black text-[15px] text-muted-foreground">
                      {title}
                    </span>
                  )}
                  <span className="text-[13px] text-muted-foreground">
                    {item
                      ? t('curricula.bookStats', {
                          topics: item.stats.topics,
                          sources: item.stats.withSource,
                          knowledge: item.stats.withKnowledge,
                        })
                      : t('curricula.bookMissing')}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  className="min-h-9 px-3 text-xs"
                  disabled={change.isPending}
                  onClick={() => change.mutate({ bookId, add: false })}
                >
                  <X className="size-4" />
                  {t('curricula.removeTextbook')}
                  <span className="sr-only"> ({title})</span>
                </Button>
              </li>
            );
          })}
        </ul>
      )}
      <AddTextbookDialog
        open={adding}
        curriculum={curriculum}
        library={library}
        change={change}
        onClose={() => setAdding(false)}
      />
    </section>
  );
}
