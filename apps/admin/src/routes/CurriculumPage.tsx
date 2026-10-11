import { BookOpen, ListTree, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { CURRICULUM_TITLE_MAX } from '@mytutor/schemas';
import { CurriculumTextbooks } from '@/components/curricula/CurriculumTextbooks';
import { DeleteCurriculumDialog } from '@/components/curricula/DeleteCurriculumDialog';
import { MetaDialog } from '@/components/forms/MetaDialog';
import { Badge, Button, EmptyState, ErrorState, LoadingState, TabNav } from '@/components/ui';
import { useSaveCurriculum } from '@/features/curricula/mutations';
import { usePageCrumbs } from '@/features/layout/crumbs';
import { useLibrary } from '@/features/progress/useLibrary';
import { subjectAndGrade } from '@/lib/grades';
import { NotFoundPage } from './NotFoundPage';

type CurriculumPageProps = { tab: 'textbooks' | 'topics' };

/** One curriculum: its textbooks now, its topics, lessons and scenarios as they come. */
export function CurriculumPage({ tab }: CurriculumPageProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { curriculumId = '' } = useParams();
  const { index, library } = useLibrary();
  const entry = index.data?.curricula.find((c) => c.id === curriculumId) ?? null;
  const save = useSaveCurriculum(curriculumId);
  const [dialog, setDialog] = useState<'meta' | 'delete' | null>(null);
  const base = `/curricula/${encodeURIComponent(curriculumId)}`;
  usePageCrumbs([
    { label: t('nav.overview'), to: '/' },
    { label: t('curricula.title'), to: '/curricula' },
    { label: entry?.title ?? '…' },
  ]);

  if (index.isPending) return <LoadingState />;
  if (index.isError) return <ErrorState onRetry={() => void index.refetch()} />;
  if (!entry) return <NotFoundPage />;
  const close = () => {
    save.reset();
    setDialog(null);
  };

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end gap-4">
        <div className="flex min-w-0 flex-[1_1_26rem] flex-col gap-2">
          <h1 className="font-sans-black text-3xl text-foreground">{entry.title}</h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {subjectAndGrade(t, entry) ? <span>{subjectAndGrade(t, entry)}</span> : null}
            <Badge tone="primary">
              {t('curricula.textbooks', { count: entry.textbooks.length })}
            </Badge>
          </div>
        </div>
        <Button variant="secondary" onClick={() => setDialog('meta')}>
          <Pencil className="size-4" />
          {t('curricula.edit')}
        </Button>
        <Button
          variant="ghost"
          className="text-destructive hover:bg-destructive-muted hover:text-destructive"
          onClick={() => setDialog('delete')}
        >
          <Trash2 className="size-4" />
          {t('curricula.delete')}
        </Button>
      </header>
      <TabNav
        label={entry.title}
        tabs={[
          {
            to: base,
            end: true,
            label: t('curricula.tabs.textbooks'),
            icon: <BookOpen className="size-4" />,
          },
          {
            to: `${base}/topics`,
            label: t('curricula.tabs.topics'),
            icon: <ListTree className="size-4" />,
          },
        ]}
      />
      {tab === 'textbooks' ? (
        <CurriculumTextbooks curriculum={entry} library={library} />
      ) : (
        <EmptyState
          icon={<ListTree className="size-6" />}
          title={t('curricula.topicsSoonTitle')}
          body={t('curricula.topicsSoonBody')}
        />
      )}
      <MetaDialog
        open={dialog === 'meta'}
        texts={{
          newTitle: t('curricula.newTitle'),
          editTitle: t('curricula.editTitle'),
          newBody: t('curricula.newBody'),
          titlePlaceholder: t('curricula.titlePlaceholder'),
        }}
        titleMax={CURRICULUM_TITLE_MAX}
        initial={entry}
        pending={save.isPending}
        error={save.error}
        onSubmit={(meta) => save.mutate(meta, { onSuccess: close })}
        onClose={close}
      />
      <DeleteCurriculumDialog
        entry={entry}
        open={dialog === 'delete'}
        onClose={close}
        onDeleted={() => void navigate('/curricula', { replace: true })}
      />
    </div>
  );
}
