import { Plus, Upload } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CurriculumEntry } from '@mytutor/types';
import { ActionError } from '@/components/books/ActionError';
import { AddBookDialog } from '@/components/books/AddBookDialog';
import { Button, Dialog } from '@/components/ui';
import { bookTitle } from '@/features/content/pages';
import type { useCurriculumTextbook } from '@/features/curricula/mutations';
import type { LibraryBook } from '@/features/progress/useLibrary';

type AddTextbookDialogProps = {
  open: boolean;
  curriculum: CurriculumEntry;
  library: LibraryBook[];
  change: ReturnType<typeof useCurriculumTextbook>;
  onClose: () => void;
};

/** Pick textbooks from the library, or upload a new one straight into the curriculum. */
export function AddTextbookDialog({
  open,
  curriculum,
  library,
  change,
  onClose,
}: AddTextbookDialogProps) {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);
  const available = library.filter(
    (b) => !curriculum.textbooks.some((tb) => tb.bookId === b.book.id),
  );

  return (
    <>
      <Dialog
        open={open && !uploading}
        title={t('curricula.addTextbook')}
        closeLabel={t('meta.close')}
        onClose={onClose}
      >
        <div className="flex flex-col gap-4 text-sm">
          <p className="text-muted-foreground">{t('curricula.addTextbookBody')}</p>
          {available.length ? (
            <ul className="divide-y divide-border rounded-md border border-border">
              {available.map(({ book, stats }) => (
                <li key={book.id} className="flex items-center gap-3 px-3 py-2.5">
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-sans-bold text-foreground">
                      {bookTitle(book)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {t('books.topics', { count: stats.topics })}
                    </span>
                  </span>
                  <Button
                    variant="secondary"
                    className="min-h-9 px-3 text-xs"
                    disabled={change.isPending}
                    onClick={() => change.mutate({ bookId: book.id, add: true })}
                  >
                    <Plus className="size-4" />
                    {t('curricula.add')}
                    <span className="sr-only"> ({bookTitle(book)})</span>
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-md bg-muted px-3 py-3 text-muted-foreground">
              {t('curricula.allAdded')}
            </p>
          )}
          {change.isError ? <ActionError error={change.error} /> : null}
          <div className="flex flex-wrap justify-between gap-2">
            <Button variant="secondary" onClick={() => setUploading(true)}>
              <Upload className="size-4" />
              {t('curricula.uploadTextbook')}
            </Button>
            <Button variant="ghost" onClick={onClose}>
              {t('curricula.done')}
            </Button>
          </div>
        </div>
      </Dialog>
      <AddBookDialog
        open={uploading}
        onClose={() => setUploading(false)}
        onAdded={(bookId) => change.mutate({ bookId, add: true })}
      />
    </>
  );
}
