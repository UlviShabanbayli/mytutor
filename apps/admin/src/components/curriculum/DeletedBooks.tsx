import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import type { TrashEntry } from '@mytutor/types';
import { DeletedBookRow } from './DeletedBookRow';

type DeletedBooksProps = { entries: TrashEntry[] };

/** Books deleted from the panel, waiting in the trash on disk; hidden when there are none. */
export function DeletedBooks({ entries }: DeletedBooksProps) {
  const { t } = useTranslation();
  const headingId = useId();
  if (entries.length === 0) return null;
  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-2">
      <div className="flex flex-col gap-0.5">
        <h2 id={headingId} className="font-sans-bold text-base text-foreground">
          {t('trash.title')}
        </h2>
        <p className="text-sm text-muted-foreground">{t('trash.body')}</p>
      </div>
      <ul className="divide-y divide-border rounded-lg border border-dashed border-border">
        {entries.map((entry) => (
          <DeletedBookRow key={entry.id} entry={entry} />
        ))}
      </ul>
    </section>
  );
}
