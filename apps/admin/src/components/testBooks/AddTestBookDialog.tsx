import { useTranslation } from 'react-i18next';
import { Dialog } from '@/components/ui';
import { useAddTestBook } from '@/features/testBooks/mutations';
import { AddTestBookForm } from './AddTestBookForm';

type AddTestBookDialogProps = { open: boolean; onClose: () => void };

/** Upload a test book's PDF; on success its page opens. */
export function AddTestBookDialog({ open, onClose }: AddTestBookDialogProps) {
  const { t } = useTranslation();
  // Owned here so the dialog cannot be dismissed while an upload is running.
  const add = useAddTestBook();
  const close = () => {
    add.reset();
    onClose();
  };
  return (
    <Dialog
      open={open}
      title={t('testBooks.dialogTitle')}
      closeLabel={t('testBooks.close')}
      dismissible={!add.isPending}
      onClose={close}
    >
      <AddTestBookForm add={add} onClose={close} />
    </Dialog>
  );
}
