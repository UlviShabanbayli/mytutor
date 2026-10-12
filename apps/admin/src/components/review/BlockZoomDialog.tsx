import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TopicSource } from '@mytutor/types';
import { useBlockLabel } from '@/components/source/BlockLabel';
import { Dialog, SegmentedControl } from '@/components/ui';
import { BlockItems, type BlockItemsProps } from './BlockItems';
import { BlockSource } from './BlockSource';

type BlockZoomDialogProps = BlockItemsProps & {
  open: boolean;
  source: TopicSource;
  topicDir: string;
  onClose: () => void;
};

const SCALES = ['1', '1.5', '2'] as const;

/**
 * The block's crop large enough to read, with its items and every decision button beside it:
 * approve, correct, reject and approve the block without leaving the large view.
 */
export function BlockZoomDialog({
  open,
  source,
  topicDir,
  onClose,
  ...items
}: BlockZoomDialogProps) {
  const { t } = useTranslation();
  const blockLabel = useBlockLabel();
  const [scale, setScale] = useState<(typeof SCALES)[number]>('1');
  const { block } = items.entry;

  return (
    <Dialog
      open={open}
      title={`${items.entry.id} · ${block ? blockLabel(block) : t('review.unknownBlock')}`}
      closeLabel={t('meta.close')}
      onClose={onClose}
      className="w-[min(110rem,calc(100vw-1.5rem))] max-h-[95dvh]"
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <section aria-label={t('review.inBook')} className="flex min-w-0 flex-col gap-2">
          <SegmentedControl
            label={t('review.zoomLevel')}
            value={scale}
            onChange={setScale}
            options={SCALES.map((s) => ({
              value: s,
              label: s === '1' ? t('review.fit') : `${Number(s) * 100}%`,
            }))}
          />
          <div className="max-h-[78dvh] overflow-auto rounded-md">
            {block ? (
              <BlockSource
                block={block}
                source={source}
                topicDir={topicDir}
                scale={Number(scale)}
              />
            ) : null}
          </div>
        </section>
        <section
          aria-label={t('review.extracted')}
          className="max-h-[82dvh] min-w-0 overflow-y-auto pr-1"
        >
          <BlockItems {...items} />
        </section>
      </div>
    </Dialog>
  );
}
