import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { CurriculumMetaDialog } from '@/components/curriculum/CurriculumMetaDialog';
import { DeleteCurriculumDialog } from '@/components/curriculum/DeleteCurriculumDialog';
import { StandardsEditor } from '@/components/curriculum/StandardsEditor';
import { Badge, Breadcrumbs, Button, ErrorState, LoadingState } from '@/components/ui';
import { bookTitle } from '@/features/content/pages';
import { useContentIndex } from '@/features/content/queries';
import { curriculumSubtitle } from '@/features/curriculum/labels';
import { useSaveCurriculum } from '@/features/curriculum/mutations';
import { useCurriculum } from '@/features/curriculum/queries';
import { NotFoundPage } from './NotFoundPage';

export function CurriculumEditorPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { curriculumId = '' } = useParams();
  const index = useContentIndex();
  const entry = index.data?.curricula.find((c) => c.id === curriculumId) ?? null;
  const curriculum = useCurriculum(entry?.path ?? null);
  const save = useSaveCurriculum(curriculumId);
  const [dialog, setDialog] = useState<'meta' | 'delete' | null>(null);

  if (index.isPending) return <LoadingState />;
  if (index.isError) return <ErrorState onRetry={() => void index.refetch()} />;
  if (!entry) return <NotFoundPage />;
  const linkedBooks = index.data.books
    .filter((b) => b.curriculumLinks?.curriculumId === entry.id)
    .map(bookTitle);
  const close = () => {
    save.reset();
    setDialog(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs
        items={[{ label: t('curricula.title'), to: '/curricula' }, { label: entry.title }]}
      />
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-2">
          <h1 className="font-sans-black text-3xl text-foreground">{entry.title}</h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {curriculumSubtitle(t, entry) ? <span>{curriculumSubtitle(t, entry)}</span> : null}
            <Badge tone="primary">{t('curricula.standards', { count: entry.standardCount })}</Badge>
            <Badge tone={linkedBooks.length ? 'success' : 'neutral'}>
              {t('curricula.books', { count: linkedBooks.length })}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
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
        </div>
      </header>
      {curriculum.isPending ? (
        <LoadingState />
      ) : curriculum.isError ? (
        <ErrorState onRetry={() => void curriculum.refetch()} detail={curriculum.error.message} />
      ) : (
        <StandardsEditor curriculum={curriculum.data} />
      )}
      {curriculum.data ? (
        <CurriculumMetaDialog
          open={dialog === 'meta'}
          initial={entry}
          pending={save.isPending}
          error={save.error}
          onSubmit={(meta) =>
            save.mutate({ ...meta, standards: curriculum.data.standards }, { onSuccess: close })
          }
          onClose={close}
        />
      ) : null}
      <DeleteCurriculumDialog
        entry={entry}
        linkedBooks={linkedBooks}
        open={dialog === 'delete'}
        onClose={close}
        onDeleted={() => void navigate('/curricula', { replace: true })}
      />
    </div>
  );
}
