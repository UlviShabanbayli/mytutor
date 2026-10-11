import { LoaderCircle, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CurriculumStandard } from '@mytutor/types';
import { ActionError } from '@/components/books/ActionError';
import { Button, Dialog, Input } from '@/components/ui';
import { groupStandards, matchesQuery } from '@/features/curriculum/standards';
import { PickerRow } from './PickerRow';

type StandardPickerDialogProps = {
  open: boolean;
  /** What is being linked, e.g. "1.2. Koordinat müstəvisi". */
  subject: string;
  standards: CurriculumStandard[];
  selected: string[];
  pending: boolean;
  error: unknown;
  onSave: (codes: string[]) => void;
  onClose: () => void;
};

/** Pick the standards a topic or knowledge item covers: search, grouped list, checkboxes. */
export function StandardPickerDialog(props: StandardPickerDialogProps) {
  const { t } = useTranslation();
  return (
    <Dialog
      open={props.open}
      title={t('picker.title')}
      closeLabel={t('picker.close')}
      dismissible={!props.pending}
      onClose={props.onClose}
      className="w-[min(48rem,calc(100vw-2rem))]"
    >
      <Picker {...props} />
    </Dialog>
  );
}

function Picker({
  subject,
  standards,
  selected,
  pending,
  error,
  onSave,
  onClose,
}: StandardPickerDialogProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [codes, setCodes] = useState(() => new Set(selected));
  const known = useMemo(() => new Set(standards.map((s) => s.code)), [standards]);
  const removed = selected.filter((code) => !known.has(code));
  const groups = useMemo(
    () => groupStandards(standards.filter((s) => matchesQuery(s, query))),
    [standards, query],
  );
  const toggle = (code: string) =>
    setCodes((current) => {
      const next = new Set(current);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });

  return (
    <form
      className="flex flex-col gap-3 text-sm"
      onSubmit={(e) => {
        e.preventDefault();
        if (!pending) onSave([...codes]);
      }}
    >
      <p className="font-sans-bold text-foreground">{subject}</p>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          data-autofocus
          value={query}
          aria-label={t('picker.search')}
          placeholder={t('picker.search')}
          className="pl-9"
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="max-h-[55vh] overflow-y-auto rounded-md border border-border">
        {removed.length ? (
          <section className="border-b border-border bg-destructive-muted/40">
            <h3 className="px-3 py-1.5 font-sans-bold text-xs text-destructive">
              {t('picker.removed')}
            </h3>
            {removed.map((code) => (
              <PickerRow
                key={code}
                code={code}
                text={t('picker.removedText')}
                depth={0}
                checked={codes.has(code)}
                onToggle={toggle}
              />
            ))}
          </section>
        ) : null}
        {groups.length === 0 ? (
          <p className="px-3 py-8 text-center text-muted-foreground">{t('picker.noMatch')}</p>
        ) : (
          groups.map((group) => (
            <section key={group.line ?? ''} className="border-b border-border last:border-b-0">
              <h3 className="sticky top-0 z-10 bg-muted px-3 py-1.5 font-sans-bold text-xs text-foreground">
                {group.line ?? t('standards.noLine')}
              </h3>
              {group.rows.map(({ standard, depth }) => (
                <PickerRow
                  key={standard.code}
                  code={standard.code}
                  text={standard.text}
                  depth={depth}
                  checked={codes.has(standard.code)}
                  onToggle={toggle}
                />
              ))}
            </section>
          ))
        )}
      </div>
      {error ? <ActionError error={error} /> : null}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-muted-foreground">{t('picker.selected', { count: codes.size })}</span>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onClose} disabled={pending}>
            {t('picker.cancel')}
          </Button>
          <Button type="submit" disabled={pending} aria-busy={pending}>
            {pending ? (
              <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" />
            ) : null}
            {t('picker.save')}
          </Button>
        </div>
      </div>
    </form>
  );
}
