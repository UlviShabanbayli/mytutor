import { ImageIcon, Sigma, TriangleAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { SourceBlock, TopicSource } from '@mytutor/types';
import { Badge } from '@/components/ui';
import { contentUrl } from '@/features/content/api';
import { categoryOf } from '@/features/source/blocks';
import { useBlockLabel } from './BlockLabel';
import { categoryTone } from './categoryTone';
import { LineList } from './LineList';

type BlockDetailProps = { block: SourceBlock; source: TopicSource; topicDir: string };

export function BlockDetail({ block, source, topicDir }: BlockDetailProps) {
  const { t } = useTranslation();
  const label = useBlockLabel();
  const lines = source.lines.filter((l) => block.lineIds.includes(l.id));
  const figures = source.figures.filter((f) => block.figureIds.includes(f.id));
  const pages = [...new Set(block.regions.map((r) => r.printedPage ?? r.page))];

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone={categoryTone[categoryOf(block.kind)]}>
            {t(`source.kind.${block.kind}`)}
          </Badge>
          <code className="font-mono text-xs text-muted-foreground">{block.id}</code>
          <span className="text-xs text-muted-foreground">
            · {pages.map((p) => t('common.printedPage', { page: p })).join(', ')}
          </span>
        </div>
        <h3 className="font-sans-bold text-lg text-foreground">{label(block)}</h3>
        <div className="flex flex-wrap gap-1.5">
          {block.flags.hasMath ? (
            <Badge icon={<Sigma className="size-3" />}>{t('source.flags.hasMath')}</Badge>
          ) : null}
          {block.flags.hasFigure ? (
            <Badge icon={<ImageIcon className="size-3" />}>{t('source.flags.hasFigure')}</Badge>
          ) : null}
          {block.flags.lowTextQuality ? (
            <Badge
              tone="accent"
              icon={<TriangleAlert className="size-3" />}
              title={t('source.flags.lowTextQualityHint')}
            >
              {t('source.flags.lowTextQuality')}
            </Badge>
          ) : null}
        </div>
      </header>

      <section className="flex flex-col gap-2">
        <h4 className="font-sans-bold text-xs uppercase tracking-wide text-muted-foreground">
          {t('source.crops')}
        </h4>
        {block.crops.map((crop) => (
          <img
            key={crop}
            src={contentUrl(topicDir, crop)}
            alt={label(block)}
            loading="lazy"
            className="w-full rounded-sm border border-border bg-white"
          />
        ))}
      </section>

      {figures.length ? (
        <section className="flex flex-col gap-2">
          <h4 className="font-sans-bold text-xs uppercase tracking-wide text-muted-foreground">
            {t('source.figures', { count: figures.length })}
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {figures.map((f) => (
              <figure key={f.id} className="flex flex-col gap-1">
                <img
                  src={contentUrl(topicDir, f.image)}
                  alt={f.labels.join(', ') || f.id}
                  loading="lazy"
                  className="w-full rounded-sm border border-border bg-white"
                />
                <figcaption className="text-xs text-muted-foreground">
                  <code className="font-mono">{f.id}</code>
                  {f.labels.length ? ` · ${f.labels.join(', ')}` : ''}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      <section className="flex flex-col gap-2">
        <h4 className="font-sans-bold text-xs uppercase tracking-wide text-muted-foreground">
          {t('source.lines', { count: lines.length })}
        </h4>
        {lines.length ? (
          <LineList lines={lines} />
        ) : (
          <p className="text-sm text-muted-foreground">{t('source.noLines')}</p>
        )}
      </section>
    </div>
  );
}
