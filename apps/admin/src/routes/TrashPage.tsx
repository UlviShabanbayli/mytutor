import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DeletedBookRow } from '@/components/trash/DeletedBookRow';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui';
import { useContentIndex } from '@/features/content/queries';

/** Deleted books, waiting in the trash on disk: restore them or erase them for good. */
export function TrashPage() {
  const { t } = useTranslation();
  const index = useContentIndex();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-sans-black text-3xl text-foreground">{t('trash.title')}</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">{t('trash.body')}</p>
      </header>
      {index.isPending ? (
        <LoadingState />
      ) : index.isError ? (
        <ErrorState onRetry={() => void index.refetch()} detail={index.error.message} />
      ) : index.data.trash.length === 0 ? (
        <EmptyState
          icon={<Trash2 className="size-6" />}
          title={t('trash.emptyTitle')}
          body={t('trash.emptyBody')}
        />
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border bg-card">
          {index.data.trash.map((entry) => (
            <DeletedBookRow key={entry.id} entry={entry} />
          ))}
        </ul>
      )}
    </div>
  );
}
