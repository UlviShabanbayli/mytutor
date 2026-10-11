import { ChevronRight, ListChecks } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import type { StandardSetEntry } from '@mytutor/types';
import { subjectAndGrade } from '@/lib/grades';

type StandardSetCardProps = { entry: StandardSetEntry; bookCount: number };

/** A standard set in the catalog: what it is, how many standards, how many books link to it. */
export function StandardSetCard({ entry, bookCount }: StandardSetCardProps) {
  const { t } = useTranslation();
  const details = [
    t('standardSets.standards', { count: entry.standardCount }),
    t('standardSets.books', { count: bookCount }),
  ];
  return (
    <Link
      to={`/standards/${encodeURIComponent(entry.id)}`}
      className="group flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-4 transition-colors hover:border-primary/40 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
        <ListChecks className="size-5" aria-hidden />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate font-sans-bold text-base text-foreground">{entry.title}</span>
        <span className="truncate text-xs text-muted-foreground">
          {[subjectAndGrade(t, entry), ...details].filter(Boolean).join(' · ')}
        </span>
      </span>
      <ChevronRight
        className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
        aria-hidden
      />
    </Link>
  );
}
