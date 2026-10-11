import { useTranslation } from 'react-i18next';
import type { SourceFigure } from '@mytutor/types';
import { contentUrl } from '@/features/content/api';
import { figureWidth } from '@/features/knowledge/items';

type ItemFiguresProps = { figures: SourceFigure[]; topicDir: string; onSelect: () => void };

/**
 * The drawings an item's text relies on, under the text at their printed size (capped by the
 * card). Clicking one selects the item, so the source panel shows it full size.
 */
export function ItemFigures({ figures, topicDir, onSelect }: ItemFiguresProps) {
  const { t } = useTranslation();
  return (
    <div
      role="group"
      aria-label={t('knowledge.figures')}
      className="flex flex-wrap items-start gap-2"
    >
      {figures.map((f) => (
        <figure key={f.id} className="flex min-w-0 max-w-full flex-col gap-1">
          <button
            type="button"
            onClick={onSelect}
            title={t('knowledge.showFigure')}
            className="block cursor-pointer rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <img
              src={contentUrl(topicDir, f.image)}
              alt={t('knowledge.figureAlt', { id: f.id })}
              loading="lazy"
              width={figureWidth(f.region.bbox)}
              // Reserves the height before the lazy image loads, so the list does not shift.
              style={{ aspectRatio: `${f.region.bbox.width} / ${f.region.bbox.height}` }}
              className="block h-auto max-h-48 max-w-full rounded-sm border border-border bg-white object-contain"
            />
          </button>
          <figcaption aria-hidden="true" className="font-mono text-xs text-muted-foreground">
            {f.id}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
