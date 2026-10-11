import { LoaderCircle, TriangleAlert, Trash2 } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TrashEntry } from '@mytutor/types';
import { ActionError } from '@/components/books/ActionError';
import { Button, Dialog, Input } from '@/components/ui';
import { usePurgeTrash } from '@/features/content/mutations';

type PurgeBookDialogProps = { entry: TrashEntry; open: boolean; onClose: () => void };

/**
 * Confirms erasing a deleted book for good. Nothing can bring it back, so the book's title must
 * be typed first: a slip of the mouse is never enough.
 */
export function PurgeBookDialog({ entry, open, onClose }: PurgeBookDialogProps) {
  const { t } = useTranslation();
  const purge = usePurgeTrash();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [typed, setTyped] = useState('');
  const title = entry.title ?? entry.bookId;
  const confirmed = typed.trim() === title.trim();
  const close = () => {
    purge.reset();
    setTyped('');
    onClose();
  };
  const submit = () => {
    if (confirmed && !purge.isPending) purge.mutate(entry.id, { onSuccess: close });
  };

  return (
    <Dialog
      open={open}
      title={t('purge.title')}
      closeLabel={t('purge.close')}
      dismissible={!purge.isPending}
      initialFocus={inputRef}
      onClose={close}
    >
      <form
        className="flex flex-col gap-4 text-sm"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <p className="text-foreground">{t('purge.body', { title })}</p>
        <ul className="list-disc pl-5 text-muted-foreground">
          <li>{t('purge.files')}</li>
          {entry.sourceCount ? <li>{t('purge.sources', { count: entry.sourceCount })}</li> : null}
          {entry.knowledgeCount ? (
            <li className="font-sans-bold text-foreground">
              {t('purge.knowledge', { count: entry.knowledgeCount })}
            </li>
          ) : null}
          <li>{t('purge.links')}</li>
        </ul>
        <p className="flex items-start gap-2 rounded-md bg-destructive-muted px-3 py-2 text-destructive">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          {t('purge.final')}
        </p>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={inputId} className="text-foreground">
            {t('purge.typeLabel')} <span className="font-sans-bold">{title}</span>
          </label>
          <Input
            id={inputId}
            ref={inputRef}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            disabled={purge.isPending}
          />
        </div>
        {purge.isError ? <ActionError error={purge.error} /> : null}
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="ghost" onClick={close} disabled={purge.isPending}>
            {t('purge.cancel')}
          </Button>
          <Button
            type="submit"
            variant="danger"
            disabled={!confirmed || purge.isPending}
            aria-busy={purge.isPending}
          >
            {purge.isPending ? (
              <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" />
            ) : (
              <Trash2 className="size-4" />
            )}
            <span aria-live="polite">
              {purge.isPending ? t('purge.pending') : t('purge.submit')}
            </span>
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
