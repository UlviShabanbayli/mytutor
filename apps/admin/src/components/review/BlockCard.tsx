import { Maximize2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TopicSource } from '@mytutor/types';
import { useBlockLabel } from '@/components/source/BlockLabel';
import { Button } from '@/components/ui';
import { BlockItems, type BlockItemsProps } from './BlockItems';
import { BlockSource } from './BlockSource';

type BlockCardProps = BlockItemsProps & {
  source: TopicSource;
  topicDir: string;
  /** Opens the block large, with the same decisions beside it. */
  onZoom: () => void;
};

/** The block being reviewed: the printed text beside what was extracted from it. */
export function BlockCard({ source, topicDir, onZoom, ...items }: BlockCardProps) {
  const { t } = useTranslation();
  const blockLabel = useBlockLabel();
  const { entry } = items;
  const { block } = entry;
  const page = block?.regions[0];
  const flags = [
    block?.flags.hasMath ? t('source.flags.hasMath') : null,
    block?.flags.hasFigure ? t('source.flags.hasFigure') : null,
  ].filter(Boolean);

  return (
    <article className="flex flex-col gap-4 rounded-xl border-2 border-primary bg-card p-4 shadow-[0_12px_32px_rgb(14_23_38/0.08)] sm:p-5">
      <header className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[13px] font-sans-black text-primary">{entry.id}</span>
        <h2 className="flex-1 font-sans-black text-[19px] text-foreground">
          {block ? blockLabel(block) : t('review.unknownBlock')}
        </h2>
        {page ? (
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-sans-bold text-foreground">
            {[t('common.printedPage', { page: page.printedPage ?? page.page }), ...flags].join(
              ' · ',
            )}
          </span>
        ) : null}
        {block ? (
          <Button variant="secondary" className="min-h-9 px-3 text-xs" onClick={onZoom}>
            <Maximize2 className="size-4" />
            {t('review.zoom')}
          </Button>
        ) : null}
      </header>
      <div className="flex flex-wrap items-start gap-4">
        <section
          aria-label={t('review.inBook')}
          className="flex min-w-0 flex-[1_1_15rem] flex-col gap-2"
        >
          <span className="text-xs font-sans-black uppercase text-muted-foreground">
            {t('review.inBook')}
          </span>
          {block ? (
            <BlockSource block={block} source={source} topicDir={topicDir} onZoom={onZoom} />
          ) : null}
        </section>
        <section
          aria-label={t('review.extracted')}
          className="flex min-w-0 flex-[1.3_1_20rem] flex-col"
        >
          <BlockItems {...items} />
        </section>
      </div>
    </article>
  );
}
