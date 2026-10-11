import { ListChecks, Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { StandardSetCard } from '@/components/standards/StandardSetCard';
import { StandardSetMetaDialog } from '@/components/standards/StandardSetMetaDialog';
import { Button, EmptyState, ErrorState, LoadingState } from '@/components/ui';
import { useContentIndex } from '@/features/content/queries';
import { useCreateStandardSet } from '@/features/standards/mutations';
import { usePageCrumbs } from '@/features/layout/crumbs';

/** The standard sets the team entered; books link their topics to their standards. */
export function StandardSetsPage() {
  const { t } = useTranslation();
  usePageCrumbs([{ label: t('nav.overview'), to: '/' }, { label: t('standardSets.title') }]);
  const navigate = useNavigate();
  const index = useContentIndex();
  const create = useCreateStandardSet();
  const [creating, setCreating] = useState(false);
  const addButton = (
    <Button onClick={() => setCreating(true)}>
      <Plus className="size-4" />
      {t('standardSets.add')}
    </Button>
  );

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="font-sans-black text-3xl text-foreground">{t('standardSets.title')}</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">{t('standardSets.subtitle')}</p>
        </div>
        {index.data?.standardSets.length ? addButton : null}
      </header>
      {index.isPending ? (
        <LoadingState />
      ) : index.isError ? (
        <ErrorState onRetry={() => void index.refetch()} detail={index.error.message} />
      ) : index.data.standardSets.length === 0 ? (
        <EmptyState
          icon={<ListChecks className="size-6" />}
          title={t('standardSets.emptyTitle')}
          body={t('standardSets.emptyBody')}
        >
          {addButton}
        </EmptyState>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {index.data.standardSets.map((entry) => (
            <StandardSetCard
              key={entry.id}
              entry={entry}
              bookCount={
                index.data.books.filter((b) => b.standardLinks?.standardSetId === entry.id).length
              }
            />
          ))}
        </div>
      )}
      <StandardSetMetaDialog
        open={creating}
        pending={create.isPending}
        error={create.error}
        onSubmit={(meta) =>
          create.mutate(
            { ...meta, standards: [] },
            { onSuccess: ({ id }) => void navigate(`/standards/${encodeURIComponent(id)}`) },
          )
        }
        onClose={() => {
          create.reset();
          setCreating(false);
        }}
      />
    </div>
  );
}
