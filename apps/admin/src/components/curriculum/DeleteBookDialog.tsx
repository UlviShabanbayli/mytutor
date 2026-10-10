import { LoaderCircle, RotateCcw, Trash2, TriangleAlert } from 'lucide-react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { ContentBookEntry } from '@mytutor/types';
import { Button, Dialog } from '@/components/ui';
import { useDeleteBook } from '@/features/content/mutations';
import { bookTitle } from '@/features/content/pages';
import { ActionError } from './ActionError';

type DeleteBookDialogProps = {
  book: ContentBookEntry;
  open: boolean;
  onClose: () => void;
  /** Runs after the book went to the trash, e.g. to leave the deleted book's page. */
  onDeleted?: () => void;
};

/** Confirms deleting a book: says what goes with it and that it can be restored. */
export function DeleteBookDialog({ book, open, onClose, onDeleted }: DeleteBookDialogProps) {
  const { t } = useTranslation();
  const remove = useDeleteBook();
  // The safe choice has the focus, so Enter right after opening never deletes.
  const cancelRef = useRef<HTMLButtonElement>(null);
  const sources = book.topics.filter((topic) => topic.source).length;
  const knowledge = book.topics.filter((topic) => topic.knowledge).length;
  const close = () => {
    remove.reset();
    onClose();
  };

  return (
    <Dialog
      open={open}
      title={t('deleteBook.title')}
      closeLabel={t('deleteBook.close')}
      dismissible={!remove.isPending}
      initialFocus={cancelRef}
      onClose={close}
    >
      <div className="flex flex-col gap-4 text-sm">
        <div className="flex flex-col gap-2">
          <p className="text-foreground">{t('deleteBook.body', { title: bookTitle(book) })}</p>
          <ul className="list-disc pl-5 text-muted-foreground marker:text-muted-foreground">
            {book.structure ? <li>{t('deleteBook.structure')}</li> : null}
            {sources ? <li>{t('deleteBook.sources', { count: sources })}</li> : null}
            {knowledge ? (
              <li className="font-sans-bold text-foreground">
                {t('deleteBook.knowledge', { count: knowledge })}
              </li>
            ) : null}
          </ul>
        </div>
        {knowledge ? (
          <p className="flex items-start gap-2 rounded-md bg-accent-muted px-3 py-2 text-foreground">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
            {t('deleteBook.knowledgeCost')}
          </p>
        ) : null}
        <p className="flex items-start gap-2 text-muted-foreground">
          <RotateCcw className="mt-0.5 size-4 shrink-0" aria-hidden />
          {t('deleteBook.recoverable')}
        </p>
        {remove.isError ? <ActionError error={remove.error} /> : null}
        <div className="flex flex-wrap justify-end gap-2">
          <Button ref={cancelRef} variant="ghost" onClick={close} disabled={remove.isPending}>
            {t('deleteBook.cancel')}
          </Button>
          <Button
            variant="danger"
            disabled={remove.isPending}
            aria-busy={remove.isPending}
            onClick={() =>
              remove.mutate(book.id, {
                onSuccess: () => {
                  close();
                  onDeleted?.();
                },
              })
            }
          >
            {remove.isPending ? (
              <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" />
            ) : (
              <Trash2 className="size-4" />
            )}
            <span aria-live="polite">
              {remove.isPending ? t('deleteBook.pending') : t('deleteBook.submit')}
            </span>
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
