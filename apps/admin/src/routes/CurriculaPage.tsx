import { ListChecks, Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { CurriculumCard } from '@/components/curriculum/CurriculumCard';
import { CurriculumMetaDialog } from '@/components/curriculum/CurriculumMetaDialog';
import { Button, EmptyState, ErrorState, LoadingState } from '@/components/ui';
import { useContentIndex } from '@/features/content/queries';
import { useCreateCurriculum } from '@/features/curriculum/mutations';
import { usePageCrumbs } from '@/features/layout/crumbs';

/** The curricula the team entered; books link their topics to their standards. */
export function CurriculaPage() {
  const { t } = useTranslation();
  usePageCrumbs([{ label: t('nav.overview'), to: '/' }, { label: t('curricula.title') }]);
  const navigate = useNavigate();
  const index = useContentIndex();
  const create = useCreateCurriculum();
  const [creating, setCreating] = useState(false);
  const addButton = (
    <Button onClick={() => setCreating(true)}>
      <Plus className="size-4" />
      {t('curricula.add')}
    </Button>
  );

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="font-sans-black text-3xl text-foreground">{t('curricula.title')}</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">{t('curricula.subtitle')}</p>
        </div>
        {index.data?.curricula.length ? addButton : null}
      </header>
      {index.isPending ? (
        <LoadingState />
      ) : index.isError ? (
        <ErrorState onRetry={() => void index.refetch()} detail={index.error.message} />
      ) : index.data.curricula.length === 0 ? (
        <EmptyState
          icon={<ListChecks className="size-6" />}
          title={t('curricula.emptyTitle')}
          body={t('curricula.emptyBody')}
        >
          {addButton}
        </EmptyState>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {index.data.curricula.map((entry) => (
            <CurriculumCard
              key={entry.id}
              entry={entry}
              bookCount={
                index.data.books.filter((b) => b.curriculumLinks?.curriculumId === entry.id).length
              }
            />
          ))}
        </div>
      )}
      <CurriculumMetaDialog
        open={creating}
        pending={create.isPending}
        error={create.error}
        onSubmit={(meta) =>
          create.mutate(
            { ...meta, standards: [] },
            { onSuccess: ({ id }) => void navigate(`/curricula/${encodeURIComponent(id)}`) },
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
