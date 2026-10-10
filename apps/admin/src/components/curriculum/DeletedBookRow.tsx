import { LoaderCircle, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TrashEntry } from '@mytutor/types';
import { Button } from '@/components/ui';
import { useRestoreBook } from '@/features/content/mutations';
import { ActionError } from './ActionError';

type DeletedBookRowProps = { entry: TrashEntry };

/** One deleted book: what it held, when it was deleted, and a way back. */
export function DeletedBookRow({ entry }: DeletedBookRowProps) {
  const { t, i18n } = useTranslation();
  const restore = useRestoreBook();
  const title = entry.title ?? entry.bookId;
  // Numeric parts only: browsers without Azerbaijani month names print "M10" for them.
  const date = new Intl.DateTimeFormat(i18n.language, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(entry.deletedAt));
  const details = [
    t('trash.deletedAt', { date }),
    entry.sourceCount ? t('trash.sources', { count: entry.sourceCount }) : null,
    entry.knowledgeCount ? t('trash.knowledge', { count: entry.knowledgeCount }) : null,
  ].filter(Boolean);

  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate font-sans-bold text-sm text-foreground">{title}</span>
        <span className="text-xs text-muted-foreground">{details.join(' · ')}</span>
        {restore.isError ? (
          <ActionError error={restore.error} compact className="mt-1 self-start" />
        ) : null}
      </div>
      <Button
        variant="secondary"
        className="min-h-9 px-3 text-xs"
        disabled={restore.isPending}
        aria-busy={restore.isPending}
        onClick={() => restore.mutate(entry.id)}
      >
        {restore.isPending ? (
          <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" />
        ) : (
          <RotateCcw className="size-4" />
        )}
        <span aria-live="polite">
          {restore.isPending ? t('trash.restoring') : t('trash.restore')}
        </span>
        <span className="sr-only"> ({title})</span>
      </Button>
    </li>
  );
}
