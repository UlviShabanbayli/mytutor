import { ChevronRight, Layers } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import type { CurriculumEntry } from '@mytutor/types';
import { subjectAndGrade } from '@/lib/grades';

type CurriculumCardProps = { entry: CurriculumEntry };

/** A curriculum in the list: what it is and how many textbooks it draws on. */
export function CurriculumCard({ entry }: CurriculumCardProps) {
  const { t } = useTranslation();
  const subtitle = subjectAndGrade(t, entry);
  return (
    <Link
      to={`/curricula/${encodeURIComponent(entry.id)}`}
      className="group flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-4 transition-colors hover:border-primary/40 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
        <Layers className="size-5" aria-hidden />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate font-sans-black text-base text-foreground">{entry.title}</span>
        <span className="truncate text-xs text-muted-foreground">
          {[subtitle, t('curricula.textbooks', { count: entry.textbooks.length })]
            .filter(Boolean)
            .join(' · ')}
        </span>
      </span>
      <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden />
    </Link>
  );
}
