import { LoaderCircle, Trash2 } from 'lucide-react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { CurriculumEntry } from '@mytutor/types';
import { ActionError } from '@/components/books/ActionError';
import { Button, Dialog } from '@/components/ui';
import { useDeleteCurriculum } from '@/features/curricula/mutations';

type DeleteCurriculumDialogProps = {
  entry: CurriculumEntry;
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
};

/** Deletes an empty curriculum; one with textbooks says what to do first. */
export function DeleteCurriculumDialog({
  entry,
  open,
  onClose,
  onDeleted,
}: DeleteCurriculumDialogProps) {
  const { t } = useTranslation();
  const remove = useDeleteCurriculum();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const blocked = entry.textbooks.length > 0;
  const close = () => {
    remove.reset();
    onClose();
  };

  return (
    <Dialog
      open={open}
      title={t('curricula.deleteTitle')}
      closeLabel={t('meta.close')}
      dismissible={!remove.isPending}
      initialFocus={cancelRef}
      onClose={close}
    >
      <div className="flex flex-col gap-4 text-sm">
        <p className="text-foreground">
          {blocked
            ? t('curricula.deleteBlocked', { count: entry.textbooks.length })
            : t('curricula.deleteBody', { title: entry.title })}
        </p>
        {remove.isError ? <ActionError error={remove.error} /> : null}
        <div className="flex flex-wrap justify-end gap-2">
          <Button ref={cancelRef} variant="ghost" onClick={close} disabled={remove.isPending}>
            {t('meta.cancel')}
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
              {t('curricula.delete')}
            </Button>
          )}
        </div>
      </div>
    </Dialog>
  );
}
