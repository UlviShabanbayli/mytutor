import { useTranslation } from 'react-i18next';
import { isFlagged } from '@mytutor/schemas';
import type { ItemReview, KnowledgeItem, TopicSource } from '@mytutor/types';
import { useBlockLabel } from '@/components/source/BlockLabel';
import type { ReviewBlock } from '@/features/review/queue';
import type { ReviewActions } from '@/features/review/useTopicReview';
import { BlockFooter } from './BlockFooter';
import { BlockSource } from './BlockSource';
import { ItemDecisionCard } from './ItemDecisionCard';

type BlockCardProps = {
  entry: ReviewBlock;
  source: TopicSource;
  topicDir: string;
  decisions: Map<string, ItemReview>;
  actions: ReviewActions;
  next: string | null;
  onNext: () => void;
  itemStandards?: (item: KnowledgeItem) => React.ReactNode;
};

/** The block being reviewed: the printed text beside what was extracted from it. */
export function BlockCard({
  entry,
  source,
  topicDir,
  decisions,
  actions,
  next,
  onNext,
  itemStandards,
}: BlockCardProps) {
  const { t } = useTranslation();
  const blockLabel = useBlockLabel();
  const { block, items } = entry;
  const page = block?.regions[0];
  const clean = items.filter((item) => !decisions.has(item.id) && !isFlagged(item));
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
      </header>
      <div className="flex flex-wrap items-start gap-4">
        <section
          aria-label={t('review.inBook')}
          className="flex min-w-0 flex-[1_1_15rem] flex-col gap-2"
        >
          <span className="text-xs font-sans-black uppercase text-muted-foreground">
            {t('review.inBook')}
          </span>
          {block ? <BlockSource block={block} source={source} topicDir={topicDir} /> : null}
        </section>
        <section
          aria-label={t('review.extracted')}
          className="flex min-w-0 flex-[1.3_1_20rem] flex-col gap-2"
        >
          <span className="text-xs font-sans-black uppercase text-muted-foreground">
            {t('review.extractedCount', { count: items.length })}
          </span>
          {items.map((item) => (
            <ItemDecisionCard
              key={item.id}
              item={item}
              decision={decisions.get(item.id)}
              actions={actions}
              canUndo={!entry.approved}
              standards={itemStandards?.(item)}
            />
          ))}
        </section>
      </div>
      <BlockFooter
        blockId={entry.id}
        approved={entry.approved}
        itemCount={items.length}
        open={entry.open}
        clean={clean.length}
        next={next}
        onApproveClean={() => actions.decideAll(clean, 'approved')}
        onApprove={() => actions.approveBlock(entry.id, items)}
        onReopen={() => actions.reopenBlock(entry.id)}
        onNext={onNext}
      />
    </article>
  );
}
