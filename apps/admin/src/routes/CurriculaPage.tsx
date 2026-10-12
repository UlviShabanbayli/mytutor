import { Layers, Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { CURRICULUM_TITLE_MAX } from '@mytutor/schemas';
import { CurriculumCard } from '@/components/curricula/CurriculumCard';
import { MetaDialog } from '@/components/forms/MetaDialog';
import { Button, EmptyState, ErrorState, LoadingState } from '@/components/ui';
import { useContentIndex } from '@/features/content/queries';
import { useCreateCurriculum } from '@/features/curricula/mutations';
import { usePageCrumbs } from '@/features/layout/crumbs';

/** The courses the team builds, one per subject and grade. */
export function CurriculaPage() {
  const { t } = useTranslation();
  usePageCrumbs([{ label: t('nav.overview'), to: '/' }, { label: t('curricula.title') }]);
  const navigate = useNavigate();
  const index = useContentIndex();
  const create = useCreateCurriculum();
  const [creating, setCreating] = useState(false);
  const addButton = (
    <Button className="h-12 rounded-md px-4" onClick={() => setCreating(true)}>
      <Plus className="size-5" />
      {t('curricula.create')}
    </Button>
  );

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end gap-4">
        <div className="flex min-w-0 flex-[1_1_26rem] flex-col gap-1.5">
          <h1 className="font-sans-black text-3xl text-foreground">{t('curricula.title')}</h1>
          <p className="max-w-3xl text-[15px] text-muted-foreground">{t('curricula.subtitle')}</p>
        </div>
        {index.data?.curricula.length ? addButton : null}
      </header>
      {index.isPending ? (
        <LoadingState />
      ) : index.isError ? (
        <ErrorState onRetry={() => void index.refetch()} detail={index.error.message} />
      ) : index.data.curricula.length === 0 ? (
        <EmptyState
          icon={<Layers className="size-6" />}
          title={t('curricula.emptyTitle')}
          body={t('curricula.emptyBody')}
        >
          {addButton}
        </EmptyState>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {index.data.curricula.map((entry) => (
            <CurriculumCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
      <MetaDialog
        open={creating}
        texts={{
          newTitle: t('curricula.newTitle'),
          editTitle: t('curricula.editTitle'),
          newBody: t('curricula.newBody'),
          titlePlaceholder: t('curricula.titlePlaceholder'),
        }}
        titleMax={CURRICULUM_TITLE_MAX}
        pending={create.isPending}
        error={create.error}
        onSubmit={(meta) =>
          create.mutate(meta, {
            onSuccess: ({ id }) => void navigate(`/curricula/${encodeURIComponent(id)}`),
          })
        }
        onClose={() => {
          create.reset();
          setCreating(false);
        }}
      />
    </div>
  );
}
