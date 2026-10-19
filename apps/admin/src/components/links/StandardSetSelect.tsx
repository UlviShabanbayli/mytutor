import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { ActionError } from '@/components/books/ActionError';
import { Button, Dialog } from '@/components/ui';
import { emptyLinks, linkCount } from '@/features/standards/links';
import type { BookStandards } from '@/features/standards/useBookStandards';

type StandardSetSelectProps = { bs: BookStandards };

/** Which standard set the book follows; switching drops the links to the old one, after asking. */
export function StandardSetSelect({ bs }: StandardSetSelectProps) {
  const { t } = useTranslation();
  const selectId = useId();
  const [next, setNext] = useState<string | null | undefined>(undefined);
  const count = linkCount(bs.links);
  const choose = (id: string | null) =>
    bs.save.mutate(emptyLinks(id), { onSuccess: () => setNext(undefined) });

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4">
      <label htmlFor={selectId} className="font-sans-bold text-sm text-foreground">
        {t('links.standardSetLabel')}
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <select
          id={selectId}
          value={bs.links.standardSetId ?? ''}
          disabled={bs.save.isPending}
          onChange={(e) => {
            const id = e.target.value || null;
            if (count) setNext(id);
            else choose(id);
          }}
          className="min-h-11 min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:max-w-md"
        >
          <option value="">{t('links.noStandardSet')}</option>
          {bs.standardSets.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
        {bs.entry ? (
          <Link
            to={`/standards/${encodeURIComponent(bs.entry.id)}`}
            className="text-sm text-primary underline-offset-2 hover:underline"
          >
            {t('links.openStandardSet')}
          </Link>
        ) : null}
      </div>
      <p className="text-xs text-muted-foreground">{t('links.standardSetHint')}</p>
      {bs.save.isError && next === undefined ? <ActionError error={bs.save.error} /> : null}
      <Dialog
        open={next !== undefined}
        title={t('links.switchTitle')}
        closeLabel={t('links.close')}
        dismissible={!bs.save.isPending}
        onClose={() => setNext(undefined)}
      >
        <div className="flex flex-col gap-4 text-sm">
          <p className="text-foreground">{t('links.switchBody', { count })}</p>
          {bs.save.isError ? <ActionError error={bs.save.error} /> : null}
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="ghost" onClick={() => setNext(undefined)} disabled={bs.save.isPending}>
              {t('links.cancel')}
            </Button>
            <Button
              variant="danger"
              disabled={bs.save.isPending}
              onClick={() => choose(next ?? null)}
            >
              {t('links.switch')}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
