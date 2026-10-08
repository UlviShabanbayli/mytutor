import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { SourcePage } from '@mytutor/types';
import { cn } from '@/lib/cn';

type PageNavProps = {
  pages: SourcePage[];
  current: number;
  onChange: (page: number) => void;
};

const iconButton =
  'flex size-9 cursor-pointer items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40';

export function PageNav({ pages, current, onChange }: PageNavProps) {
  const { t } = useTranslation();
  const index = pages.findIndex((p) => p.page === current);
  const go = (i: number) => {
    const page = pages[i];
    if (page) onChange(page.page);
  };
  return (
    <nav aria-label={t('source.pageNav')} className="flex items-center gap-1">
      <button
        type="button"
        className={iconButton}
        aria-label={t('source.previousPage')}
        disabled={index <= 0}
        onClick={() => go(index - 1)}
      >
        <ChevronLeft className="size-5" />
      </button>
      <div className="flex flex-wrap gap-1">
        {pages.map((p) => (
          <button
            key={p.page}
            type="button"
            aria-current={p.page === current ? 'page' : undefined}
            onClick={() => onChange(p.page)}
            className={cn(
              'min-h-9 min-w-11 cursor-pointer rounded-sm px-2 font-sans-bold text-xs tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              p.page === current
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground',
            )}
          >
            {t('common.printedPage', { page: p.printedPage ?? p.page })}
          </button>
        ))}
      </div>
      <button
        type="button"
        className={iconButton}
        aria-label={t('source.nextPage')}
        disabled={index < 0 || index >= pages.length - 1}
        onClick={() => go(index + 1)}
      >
        <ChevronRight className="size-5" />
      </button>
    </nav>
  );
}
