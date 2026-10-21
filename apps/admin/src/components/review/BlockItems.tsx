import { useTranslation } from 'react-i18next';
import { reviewTier } from '@mytutor/schemas';
import type { ItemReview, KnowledgeItem } from '@mytutor/types';
import type { ReviewBlock } from '@/features/review/queue';
import type { ReviewActions } from '@/features/review/useTopicReview';
import { BlockFooter } from './BlockFooter';
import { ItemDecisionCard } from './ItemDecisionCard';

export type BlockItemsProps = {
  entry: ReviewBlock;
  decisions: Map<string, ItemReview>;
  actions: ReviewActions;
  next: string | null;
  onNext: () => void;
  itemStandards?: (item: KnowledgeItem) => React.ReactNode;
};

/** A block's extracted items with their decisions, and the block's approve bar under them. */
export function BlockItems({
  entry,
  decisions,
  actions,
  next,
  onNext,
  itemStandards,
}: BlockItemsProps) {
  const { t } = useTranslation();
  const { items } = entry;
  // Only items confirmed as printed go together; derived and flagged ones are decided one by one.
  const clean = items.filter((item) => !decisions.has(item.id) && reviewTier(item) === 'auto');
  return (
    <div className="flex min-w-0 flex-col gap-2">
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
    </div>
  );
}
