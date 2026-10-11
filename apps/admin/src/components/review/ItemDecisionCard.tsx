import { TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { isFlagged } from '@mytutor/schemas';
import type { ItemReview, KnowledgeItem } from '@mytutor/types';
import { KnowledgeItemBody } from '@/components/knowledge/KnowledgeItemBody';
import { statusTone } from '@/components/knowledge/statusTone';
import { Badge, Button, type Tone } from '@/components/ui';
import { toExtracted } from '@/features/knowledge/items';
import { cn } from '@/lib/cn';
import { DecisionButtons } from './DecisionButtons';
import type { ReviewActions } from '@/features/review/useTopicReview';

type ItemDecisionCardProps = {
  item: KnowledgeItem;
  decision: ItemReview | undefined;
  actions: ReviewActions;
  /** False once the block is approved: take the block back first. */
  canUndo: boolean;
  /** The item's curriculum standards, when the book has a curriculum. */
  standards?: ReactNode;
};

const look: Record<ItemReview['decision'], { tone: Tone; card: string }> = {
  approved: { tone: 'success', card: 'border-success/40 bg-success-muted/40' },
  needs_fix: { tone: 'accent', card: 'border-accent/50 bg-accent-muted/50' },
  rejected: { tone: 'destructive', card: 'border-border bg-muted opacity-75' },
};

/** One extracted item: what it says, why it may be wrong, and the editor's decision. */
export function ItemDecisionCard({
  item,
  decision,
  actions,
  canUndo,
  standards,
}: ItemDecisionCardProps) {
  const { t } = useTranslation();
  const extracted = toExtracted(item);
  const flagged = isFlagged(item);
  const failed = item.checks.filter((c) => c.result === 'fail');

  return (
    <article
      className={cn(
        'flex flex-col gap-2.5 rounded-md border-[1.5px] p-3',
        decision
          ? look[decision.decision].card
          : flagged
            ? 'border-destructive/40 bg-destructive-muted/30'
            : 'border-border bg-card',
      )}
    >
      <header className="flex flex-wrap items-center gap-1.5">
        <span className="font-mono text-xs font-sans-bold text-primary">{item.id}</span>
        <Badge tone="primary">{t(`knowledge.type.${item.type}`)}</Badge>
        <Badge tone={statusTone[item.status]}>{t(`knowledge.status.${item.status}`)}</Badge>
        {decision ? (
          <Badge tone={look[decision.decision].tone}>
            {t(`review.decision.${decision.decision}`)}
          </Badge>
        ) : flagged ? (
          <Badge tone="accent">{t('review.flagged')}</Badge>
        ) : null}
      </header>
      <div className="min-w-0 text-foreground">
        {extracted ? (
          <KnowledgeItemBody item={extracted} />
        ) : (
          <pre className="overflow-x-auto text-xs">{JSON.stringify(item.content, null, 2)}</pre>
        )}
      </div>
      {!decision && failed.length ? (
        <div className="flex items-start gap-2 rounded-[10px] bg-destructive-muted px-2.5 py-2 text-[13px] leading-relaxed text-destructive">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p>
            <strong className="font-sans-black">{t('review.checkFailed')}</strong>{' '}
            {failed
              .map((c) => [t(`knowledge.check.${c.name}`), c.detail].filter(Boolean).join(': '))
              .join('; ')}
          </p>
        </div>
      ) : null}
      {!decision && item.status === 'derived' ? (
        <p className="text-xs text-muted-foreground">{t('review.derivedNote')}</p>
      ) : null}
      {standards}
      {decision ? (
        <div className="flex flex-wrap items-center gap-2 text-[13px] text-foreground">
          <span className="min-w-0 flex-[1_1_12rem]">
            {decision.note
              ? `${t('review.noteLabel')} ${decision.note}`
              : t(`review.decided.${decision.decision}`)}
          </span>
          {canUndo ? (
            <Button variant="secondary" className="min-h-9" onClick={() => actions.undo(item)}>
              {t('review.undo')}
            </Button>
          ) : null}
        </div>
      ) : (
        <DecisionButtons onDecide={(d, note) => actions.decide(item, d, note)} />
      )}
    </article>
  );
}
