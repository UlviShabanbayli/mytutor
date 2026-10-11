import { useTranslation } from 'react-i18next';
import { Dialog } from '@/components/ui';
import { useAddBook } from '@/features/content/mutations';
import { AddBookForm } from './AddBookForm';

type AddBookDialogProps = { open: boolean; onClose: () => void };

/** Upload a textbook PDF; on success the new book's curriculum opens. */
export function AddBookDialog({ open, onClose }: AddBookDialogProps) {
  const { t } = useTranslation();
  // Owned here so the dialog cannot be dismissed while an upload is running.
  const add = useAddBook();
  const close = () => {
    add.reset();
    onClose();
  };
  return (
    <Dialog
      open={open}
      title={t('addBook.title')}
      closeLabel={t('addBook.close')}
      dismissible={!add.isPending}
      onClose={close}
    >
      <AddBookForm add={add} onClose={close} />
    </Dialog>
  );
}
