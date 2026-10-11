import { LoaderCircle } from 'lucide-react';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { STANDARD_SET_TITLE_MAX } from '@mytutor/schemas';
import { ActionError } from '@/components/books/ActionError';
import { Button, Dialog, Input } from '@/components/ui';
import { GRADES, gradeLabel } from '@/lib/grades';

export type StandardSetMeta = { title: string; subject: string; grade: number | null };

type StandardSetMetaDialogProps = {
  open: boolean;
  /** Present when editing; a new standard set starts empty. */
  initial?: StandardSetMeta;
  pending: boolean;
  error: unknown;
  onSubmit: (meta: StandardSetMeta) => void;
  onClose: () => void;
};

/** Title, subject and grade of a standard set: asked when it is created, editable later. */
export function StandardSetMetaDialog(props: StandardSetMetaDialogProps) {
  const { t } = useTranslation();
  const { open, initial, pending, onClose } = props;
  return (
    <Dialog
      open={open}
      title={initial ? t('standardSets.editTitle') : t('standardSets.newTitle')}
      closeLabel={t('standardSets.close')}
      dismissible={!pending}
      onClose={onClose}
    >
      <MetaForm {...props} />
    </Dialog>
  );
}

function MetaForm({ initial, pending, error, onSubmit, onClose }: StandardSetMetaDialogProps) {
  const { t } = useTranslation();
  const ids = { title: useId(), subject: useId(), grade: useId() };
  const [title, setTitle] = useState(initial?.title ?? '');
  const [subject, setSubject] = useState(initial?.subject ?? '');
  const [grade, setGrade] = useState(initial?.grade?.toString() ?? '');
  const ready = title.trim().length > 0;

  return (
    <form
      className="flex flex-col gap-4 text-sm"
      onSubmit={(e) => {
        e.preventDefault();
        if (ready && !pending)
          onSubmit({
            title: title.trim(),
            subject: subject.trim(),
            grade: grade ? Number(grade) : null,
          });
      }}
    >
      {initial ? null : <p className="text-muted-foreground">{t('standardSets.newBody')}</p>}
      <div className="flex flex-col gap-1.5">
        <label htmlFor={ids.title} className="font-sans-bold text-foreground">
          {t('standardSets.titleLabel')}
        </label>
        <Input
          id={ids.title}
          data-autofocus
          value={title}
          maxLength={STANDARD_SET_TITLE_MAX}
          placeholder={t('standardSets.titlePlaceholder')}
          onChange={(e) => setTitle(e.target.value)}
          disabled={pending}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={ids.subject} className="font-sans-bold text-foreground">
            {t('standardSets.subjectLabel')}
          </label>
          <Input
            id={ids.subject}
            value={subject}
            maxLength={80}
            placeholder={t('standardSets.subjectPlaceholder')}
            onChange={(e) => setSubject(e.target.value)}
            disabled={pending}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={ids.grade} className="font-sans-bold text-foreground">
            {t('standardSets.gradeLabel')}
          </label>
          <select
            id={ids.grade}
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            disabled={pending}
            className="min-h-11 rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">{t('standardSets.gradeNone')}</option>
            {GRADES.map((g) => (
              <option key={g} value={g}>
                {gradeLabel(t, g)}
              </option>
            ))}
          </select>
        </div>
      </div>
      {error ? <ActionError error={error} /> : null}
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="ghost" onClick={onClose} disabled={pending}>
          {t('standardSets.cancel')}
        </Button>
        <Button type="submit" disabled={!ready || pending} aria-busy={pending}>
          {pending ? (
            <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" />
          ) : null}
          {initial ? t('standardSets.save') : t('standardSets.create')}
        </Button>
      </div>
    </form>
  );
}
