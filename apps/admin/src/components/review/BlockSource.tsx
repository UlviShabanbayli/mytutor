import { useTranslation } from 'react-i18next';
import type { SourceBlock, TopicSource } from '@mytutor/types';
import { contentUrl } from '@/features/content/api';
import { figureWidth } from '@/features/knowledge/items';

type BlockSourceProps = {
  block: SourceBlock;
  source: TopicSource;
  topicDir: string;
  /** Clicking the crop opens it large; absent where it already is large. */
  onZoom?: () => void;
  /** Image width as a share of the frame (the large view zooms). */
  scale?: number;
};

/** The block as printed: its crop from the page and the drawings it holds. */
export function BlockSource({ block, source, topicDir, onZoom, scale = 1 }: BlockSourceProps) {
  const { t } = useTranslation();
  // A crop already shows the block's drawings; figures alone stand in when there is none.
  const figures = block.crops.length
    ? []
    : source.figures.filter((f) => block.figureIds.includes(f.id));
  return (
    <div className="flex flex-col gap-3 rounded-md border border-border bg-white p-3">
      {block.crops.map((crop) => {
        const image = (
          <img
            src={contentUrl(topicDir, crop)}
            alt={t('review.cropAlt', { id: block.id })}
            className="block h-auto max-w-none"
            style={{ width: `${scale * 100}%` }}
            loading="lazy"
          />
        );
        return onZoom ? (
          <button
            key={crop}
            type="button"
            onClick={onZoom}
            aria-label={t('review.zoomCrop', { id: block.id })}
            className="block w-full cursor-zoom-in rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {image}
          </button>
        ) : (
          <div key={crop}>{image}</div>
        );
      })}
      {figures.map((f) => (
        <figure key={f.id} className="flex flex-col gap-1">
          <img
            src={contentUrl(topicDir, f.image)}
            alt={t('knowledge.figureAlt', { id: f.id })}
            width={figureWidth(f.region.bbox)}
            style={{ aspectRatio: `${f.region.bbox.width} / ${f.region.bbox.height}` }}
            className="block h-auto max-w-full rounded-sm border border-border object-contain"
            loading="lazy"
          />
          <figcaption className="font-mono text-xs text-muted-foreground">{f.id}</figcaption>
        </figure>
      ))}
      {block.crops.length === 0 && figures.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">{t('review.noCrop')}</p>
      ) : null}
    </div>
  );
}
