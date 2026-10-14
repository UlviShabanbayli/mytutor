import { Check, FileText, LoaderCircle, Sparkles, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ActionError } from '@/components/books/ActionError';
import { Badge, Button, EmptyState, ErrorState, LoadingState } from '@/components/ui';
import type { LessonRef } from '@/features/lessons/api';
import { useLesson, useLessonTextActions, useLessonTextEstimate } from '@/features/lessons/queries';
import { LessonTextBody } from './LessonTextBody';

type LessonTextPanelProps = {
  lessonRef: LessonRef;
  /** The lesson file, when the index lists one. */
  path: string | null;
  /** False while the topic has no approved items: there is nothing to write from. */
  canWrite: boolean;
  pagesOf: (itemIds: string[]) => number[];
};

/**
 * The lesson text: the approved one students read, and a draft Claude wrote that waits for the
 * editor. Writing calls the paid API, so the button shows what it will cost first.
 */
export function LessonTextPanel({ lessonRef, path, canWrite, pagesOf }: LessonTextPanelProps) {
  const { t } = useTranslation();
  const lesson = useLesson(lessonRef, path);
  const { write, decide } = useLessonTextActions(lessonRef);
  const draft = lesson.data?.draft ?? null;
  const text = lesson.data?.text ?? null;
  const estimate = useLessonTextEstimate(lessonRef, canWrite && !draft);

  if (lesson.isPending) return <LoadingState />;
  if (lesson.isError) return <ErrorState onRetry={() => void lesson.refetch()} />;

  const writeButton = (
    <div className="flex flex-col items-center gap-1.5">
      <Button
        variant={text ? 'secondary' : 'primary'}
        disabled={!canWrite || write.isPending}
        onClick={() => write.mutate()}
      >
        {write.isPending ? (
          <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" />
        ) : (
          <Sparkles className="size-4" />
        )}
        {write.isPending ? t('lessons.writing') : t(text ? 'lessons.rewrite' : 'lessons.write')}
      </Button>
      {estimate.data && !write.isPending ? (
        <span className="text-xs text-muted-foreground">
          {t('lessons.estimate', { cost: estimate.data.costUsd.toFixed(2) })}
        </span>
      ) : null}
      {estimate.isError ? <ActionError error={estimate.error} compact /> : null}
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {write.isError ? <ActionError error={write.error} /> : null}
      {decide.isError ? <ActionError error={decide.error} /> : null}
      {draft ? (
        <div className="flex flex-col gap-4 rounded-lg border-2 border-accent bg-card p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="accent">{t('lessons.draft')}</Badge>
            <span className="text-xs text-muted-foreground">
              {t('lessons.draftCost', { cost: draft.costUsd.toFixed(2) })}
            </span>
          </div>
          <LessonTextBody text={draft} pagesOf={pagesOf} />
          <p className="max-w-3xl text-sm text-muted-foreground">{t('lessons.draftBody')}</p>
          <div className="flex flex-wrap gap-2">
            <Button disabled={decide.isPending} onClick={() => decide.mutate(true)}>
              <Check className="size-4" />
              {t('lessons.approve')}
            </Button>
            <Button
              variant="ghost"
              disabled={decide.isPending}
              onClick={() => decide.mutate(false)}
            >
              <X className="size-4" />
              {t('lessons.discard')}
            </Button>
          </div>
        </div>
      ) : null}
      {text ? (
        <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
          <Badge tone="success">{t('lessons.approved')}</Badge>
          <LessonTextBody text={text} pagesOf={pagesOf} />
          {draft ? null : <div className="flex">{writeButton}</div>}
        </div>
      ) : draft ? null : (
        <EmptyState
          icon={<FileText className="size-6" />}
          title={t('lessons.noTextTitle')}
          body={t(canWrite ? 'lessons.noTextBody' : 'lessons.noTextBlocked')}
        >
          {writeButton}
        </EmptyState>
      )}
    </div>
  );
}
