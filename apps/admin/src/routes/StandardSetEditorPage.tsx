import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { STANDARD_SET_TITLE_MAX } from '@mytutor/schemas';
import { MetaDialog } from '@/components/forms/MetaDialog';
import { DeleteStandardSetDialog } from '@/components/standards/DeleteStandardSetDialog';
import { StandardsEditor } from '@/components/standards/StandardsEditor';
import { Badge, Button, ErrorState, LoadingState } from '@/components/ui';
import { usePageCrumbs } from '@/features/layout/crumbs';
import { bookTitle } from '@/features/content/pages';
import { useContentIndex } from '@/features/content/queries';
import { subjectAndGrade } from '@/lib/grades';
import { useSaveStandardSet } from '@/features/standards/mutations';
import { useStandardSet } from '@/features/standards/queries';
import { NotFoundPage } from './NotFoundPage';

export function StandardSetEditorPage() {
  const { t } = useTranslation();
  const metaTexts = {
    newTitle: t('standardSets.newTitle'),
    editTitle: t('standardSets.editTitle'),
    newBody: t('standardSets.newBody'),
    titlePlaceholder: t('standardSets.titlePlaceholder'),
  };
  const navigate = useNavigate();
  const { standardSetId = '' } = useParams();
  const index = useContentIndex();
  const entry = index.data?.standardSets.find((c) => c.id === standardSetId) ?? null;
  const standardSet = useStandardSet(entry?.path ?? null);
  const save = useSaveStandardSet(standardSetId);
  const [dialog, setDialog] = useState<'meta' | 'delete' | null>(null);
  usePageCrumbs([
    { label: t('nav.overview'), to: '/' },
    { label: t('standardSets.title'), to: '/standards' },
    { label: entry?.title ?? '…' },
  ]);

  if (index.isPending) return <LoadingState />;
  if (index.isError) return <ErrorState onRetry={() => void index.refetch()} />;
  if (!entry) return <NotFoundPage />;
  const linkedBooks = index.data.books
    .filter((b) => b.standardLinks?.standardSetId === entry.id)
    .map(bookTitle);
  const close = () => {
    save.reset();
    setDialog(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-2">
          <h1 className="font-sans-black text-3xl text-foreground">{entry.title}</h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {subjectAndGrade(t, entry) ? <span>{subjectAndGrade(t, entry)}</span> : null}
            <Badge tone="primary">
              {t('standardSets.standards', { count: entry.standardCount })}
            </Badge>
            <Badge tone={linkedBooks.length ? 'success' : 'neutral'}>
              {t('standardSets.books', { count: linkedBooks.length })}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setDialog('meta')}>
            <Pencil className="size-4" />
            {t('standardSets.edit')}
          </Button>
          <Button
            variant="ghost"
            className="text-destructive hover:bg-destructive-muted hover:text-destructive"
            onClick={() => setDialog('delete')}
          >
            <Trash2 className="size-4" />
            {t('standardSets.delete')}
          </Button>
        </div>
      </header>
      {standardSet.isPending ? (
        <LoadingState />
      ) : standardSet.isError ? (
        <ErrorState onRetry={() => void standardSet.refetch()} detail={standardSet.error.message} />
      ) : (
        <StandardsEditor standardSet={standardSet.data} />
      )}
      {standardSet.data ? (
        <MetaDialog
          texts={metaTexts}
          titleMax={STANDARD_SET_TITLE_MAX}
          open={dialog === 'meta'}
          initial={entry}
          pending={save.isPending}
          error={save.error}
          onSubmit={(meta) =>
            save.mutate({ ...meta, standards: standardSet.data.standards }, { onSuccess: close })
          }
          onClose={close}
        />
      ) : null}
      <DeleteStandardSetDialog
        entry={entry}
        linkedBooks={linkedBooks}
        open={dialog === 'delete'}
        onClose={close}
        onDeleted={() => void navigate('/standards', { replace: true })}
      />
    </div>
  );
}
