import { LoaderCircle, Trash2 } from 'lucide-react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { StandardSetEntry } from '@mytutor/types';
import { ActionError } from '@/components/books/ActionError';
import { Button, Dialog } from '@/components/ui';
import { useDeleteStandardSet } from '@/features/standards/mutations';

type DeleteStandardSetDialogProps = {
  entry: StandardSetEntry;
  /** Titles of books linked to it: then it cannot be deleted. */
  linkedBooks: string[];
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
};

export function DeleteStandardSetDialog({
  entry,
  linkedBooks,
  open,
  onClose,
  onDeleted,
}: DeleteStandardSetDialogProps) {
  const { t } = useTranslation();
  const remove = useDeleteStandardSet();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const blocked = linkedBooks.length > 0;
  const close = () => {
    remove.reset();
    onClose();
  };

  return (
    <Dialog
      open={open}
      title={t('standardSets.deleteTitle')}
      closeLabel={t('standardSets.close')}
      dismissible={!remove.isPending}
      initialFocus={cancelRef}
      onClose={close}
    >
      <div className="flex flex-col gap-4 text-sm">
        {blocked ? (
          <>
            <p className="text-foreground">{t('standardSets.deleteBlocked')}</p>
            <ul className="list-disc pl-5 text-muted-foreground">
              {linkedBooks.map((title) => (
                <li key={title}>{title}</li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-foreground">
            {t('standardSets.deleteBody', { title: entry.title, count: entry.standardCount })}
          </p>
        )}
        {remove.isError ? <ActionError error={remove.error} /> : null}
        <div className="flex flex-wrap justify-end gap-2">
          <Button ref={cancelRef} variant="ghost" onClick={close} disabled={remove.isPending}>
            {t('standardSets.cancel')}
          </Button>
          {blocked ? null : (
            <Button
              variant="danger"
              disabled={remove.isPending}
              aria-busy={remove.isPending}
              onClick={() => remove.mutate(entry.id, { onSuccess: onDeleted })}
            >
              {remove.isPending ? (
                <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" />
              ) : (
                <Trash2 className="size-4" />
              )}
              {t('standardSets.delete')}
            </Button>
          )}
        </div>
      </div>
    </Dialog>
  );
}
