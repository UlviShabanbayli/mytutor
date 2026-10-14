import { LoaderCircle, RotateCcw, Trash2 } from 'lucide-react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { TestBookEntry } from '@mytutor/types';
import { ActionError } from '@/components/books/ActionError';
import { Button, Dialog } from '@/components/ui';
import { useDeleteTestBook } from '@/features/testBooks/mutations';

type DeleteTestBookDialogProps = {
  book: TestBookEntry;
  open: boolean;
  onClose: () => void;
  /** Runs after the book went to the trash, to leave its page. */
  onDeleted: () => void;
};

/** Confirms deleting a test book; its folder is moved aside, never erased. */
export function DeleteTestBookDialog({
  book,
  open,
  onClose,
  onDeleted,
}: DeleteTestBookDialogProps) {
  const { t } = useTranslation();
  const remove = useDeleteTestBook();
  // The safe choice has the focus, so Enter right after opening never deletes.
  const cancelRef = useRef<HTMLButtonElement>(null);
  const close = () => {
    remove.reset();
    onClose();
  };

  return (
    <Dialog
      open={open}
      title={t('testBooks.deleteTitle')}
      closeLabel={t('testBooks.close')}
      dismissible={!remove.isPending}
      initialFocus={cancelRef}
      onClose={close}
    >
      <div className="flex flex-col gap-4 text-sm">
        <p className="text-foreground">{t('testBooks.deleteBody', { title: book.title })}</p>
        <p className="flex items-start gap-2 text-muted-foreground">
          <RotateCcw className="mt-0.5 size-4 shrink-0" aria-hidden />
          {t('testBooks.deleteKept')}
        </p>
        {remove.isError ? <ActionError error={remove.error} /> : null}
        <div className="flex flex-wrap justify-end gap-2">
          <Button ref={cancelRef} variant="ghost" onClick={close} disabled={remove.isPending}>
            {t('testBooks.cancel')}
          </Button>
          <Button
            variant="danger"
            disabled={remove.isPending}
            aria-busy={remove.isPending}
            onClick={() =>
              remove.mutate(book.id, {
                onSuccess: () => {
                  close();
                  onDeleted();
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
              {remove.isPending ? t('testBooks.deletePending') : t('testBooks.delete')}
            </span>
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
