import { useTranslation } from 'react-i18next';
import type { SourceBlock, TopicSource } from '@mytutor/types';
import { contentUrl } from '@/features/content/api';
import { figureWidth } from '@/features/knowledge/items';

type BlockSourceProps = { block: SourceBlock; source: TopicSource; topicDir: string };

/** The block as printed: its crop from the page and the drawings it holds. */
export function BlockSource({ block, source, topicDir }: BlockSourceProps) {
  const { t } = useTranslation();
  // A crop already shows the block's drawings; figures alone stand in when there is none.
  const figures = block.crops.length
    ? []
    : source.figures.filter((f) => block.figureIds.includes(f.id));
  return (
    <div className="flex flex-col gap-3 rounded-md border border-border bg-white p-3">
      {block.crops.map((crop) => (
        <img
          key={crop}
          src={contentUrl(topicDir, crop)}
          alt={t('review.cropAlt', { id: block.id })}
          className="block h-auto w-full"
          loading="lazy"
        />
      ))}
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
