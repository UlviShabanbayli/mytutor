import { useTranslation } from 'react-i18next';
import type { SourceFigure } from '@mytutor/types';
import { contentUrl } from '@/features/content/api';
import { cn } from '@/lib/cn';

type ItemFiguresProps = { figures: SourceFigure[]; topicDir: string };

/** The drawings an item's text relies on, shown beside the text so it never reads alone. */
export function ItemFigures({ figures, topicDir }: ItemFiguresProps) {
  const { t } = useTranslation();
  return (
    <section
      aria-label={t('knowledge.figures')}
      className={cn('grid shrink-0 gap-2 sm:w-60', figures.length > 1 && 'grid-cols-2')}
    >
      {figures.map((f) => (
        <figure key={f.id} className="flex min-w-0 flex-col gap-1">
          <img
            src={contentUrl(topicDir, f.image)}
            alt={t('knowledge.figureAlt', { id: f.id })}
            loading="lazy"
            className="max-h-48 w-full rounded-sm border border-border bg-white object-contain"
          />
          <figcaption className="font-mono text-xs text-muted-foreground">{f.id}</figcaption>
        </figure>
      ))}
    </section>
  );
}
