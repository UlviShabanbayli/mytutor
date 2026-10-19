import { Link2Off, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { StandardSet, ItemStandardLink } from '@mytutor/types';
import { ActionError } from '@/components/books/ActionError';
import { Button } from '@/components/ui';
import { withoutItemLink } from '@/features/standards/links';
import type { BookStandards } from '@/features/standards/useBookStandards';
import { LinkedStandards } from './LinkedStandards';

type OrphanLinksProps = {
  orphans: ItemStandardLink[];
  standardSet: StandardSet;
  bs: BookStandards;
};

/**
 * Item links whose item changed or is gone after the knowledge document was rebuilt. They are
 * kept until removed, so nobody loses a link without seeing it.
 */
export function OrphanLinks({ orphans, standardSet, bs }: OrphanLinksProps) {
  const { t } = useTranslation();
  if (orphans.length === 0) return null;
  return (
    <section className="flex flex-col gap-2 rounded-lg border border-accent/60 bg-card p-4">
      <h2 className="flex items-center gap-2 font-sans-bold text-sm text-foreground">
        <Link2Off className="size-4 text-accent" aria-hidden />
        {t('links.orphansTitle', { count: orphans.length })}
      </h2>
      <p className="text-xs text-muted-foreground">{t('links.orphansBody')}</p>
      <ul className="flex flex-col gap-2">
        {orphans.map((orphan) => (
          <li key={`${orphan.itemId}-${orphan.fingerprint}`} className="flex items-start gap-3">
            <span className="mt-0.5 shrink-0 font-mono text-xs text-muted-foreground">
              {orphan.itemId}
            </span>
            <div className="min-w-0 flex-1">
              <LinkedStandards codes={orphan.codes} standards={standardSet.standards} compact />
            </div>
            <Button
              variant="ghost"
              className="min-h-8 px-2 text-xs"
              disabled={bs.save.isPending}
              onClick={() => bs.save.mutate(withoutItemLink(bs.links, orphan))}
            >
              <X className="size-3.5" />
              {t('links.removeOrphan')}
            </Button>
          </li>
        ))}
      </ul>
      {bs.save.isError ? <ActionError error={bs.save.error} compact /> : null}
    </section>
  );
}
