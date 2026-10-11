import { ClipboardPaste, LoaderCircle, TriangleAlert } from 'lucide-react';
import { useDeferredValue, useId, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CurriculumStandard } from '@mytutor/types';
import { ActionError } from '@/components/books/ActionError';
import { Badge, Button, Dialog, Textarea } from '@/components/ui';
import { mergeStandards, parseStandards } from '@/features/curriculum/parseStandards';
import { StandardsPreview } from './StandardsPreview';

type PasteStandardsDialogProps = {
  open: boolean;
  current: CurriculumStandard[];
  pending: boolean;
  error: unknown;
  onImport: (standards: CurriculumStandard[]) => void;
  onClose: () => void;
};

/** Paste the standards from a curriculum document; what was read is shown before it is added. */
export function PasteStandardsDialog(props: PasteStandardsDialogProps) {
  const { t } = useTranslation();
  return (
    <Dialog
      open={props.open}
      title={t('paste.title')}
      closeLabel={t('paste.close')}
      dismissible={!props.pending}
      onClose={props.onClose}
      className="w-[min(60rem,calc(100vw-2rem))]"
    >
      <PasteForm {...props} />
    </Dialog>
  );
}

function PasteForm({ current, pending, error, onImport, onClose }: PasteStandardsDialogProps) {
  const { t } = useTranslation();
  const inputId = useId();
  const [text, setText] = useState('');
  const deferred = useDeferredValue(text);
  const parsed = useMemo(() => parseStandards(deferred), [deferred]);
  const merged = useMemo(() => mergeStandards(current, parsed.standards), [current, parsed]);
  const found = parsed.standards.length;

  return (
    <form
      className="flex flex-col gap-4 text-sm"
      onSubmit={(e) => {
        e.preventDefault();
        if (found && !pending) onImport(merged.standards);
      }}
    >
      <p className="text-muted-foreground">{t('paste.body')}</p>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={inputId} className="font-sans-bold text-foreground">
            {t('paste.label')}
          </label>
          <Textarea
            id={inputId}
            autoFocus
            rows={16}
            value={text}
            placeholder={t('paste.placeholder')}
            onChange={(e) => setText(e.target.value)}
            disabled={pending}
            className="font-mono text-xs"
          />
        </div>
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-sans-bold text-foreground">{t('paste.preview')}</span>
            <Badge tone={found ? 'primary' : 'neutral'}>{t('paste.found', { count: found })}</Badge>
            {merged.added ? (
              <Badge tone="success">{t('paste.added', { count: merged.added })}</Badge>
            ) : null}
            {merged.updated ? (
              <Badge tone="accent">{t('paste.updated', { count: merged.updated })}</Badge>
            ) : null}
          </div>
          {parsed.duplicates.length ? (
            <p className="flex items-start gap-2 rounded-md bg-accent-muted px-3 py-2 text-foreground">
              <TriangleAlert className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
              {t('paste.duplicates', { codes: parsed.duplicates.join(', ') })}
            </p>
          ) : null}
          {parsed.ignored.length ? (
            <details className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
              <summary className="cursor-pointer select-none">
                {t('paste.ignored', { count: parsed.ignored.length })}
              </summary>
              <ul className="mt-1 list-disc pl-4">
                {parsed.ignored.map((row, i) => (
                  <li key={`${i}-${row}`}>{row}</li>
                ))}
              </ul>
            </details>
          ) : null}
          <StandardsPreview standards={parsed.standards} emptyText={t('paste.empty')} />
        </div>
      </div>
      {error ? <ActionError error={error} /> : null}
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="ghost" onClick={onClose} disabled={pending}>
          {t('paste.cancel')}
        </Button>
        <Button type="submit" disabled={!found || pending} aria-busy={pending}>
          {pending ? (
            <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" />
          ) : (
            <ClipboardPaste className="size-4" />
          )}
          {t('paste.submit', { count: found })}
        </Button>
      </div>
    </form>
  );
}
