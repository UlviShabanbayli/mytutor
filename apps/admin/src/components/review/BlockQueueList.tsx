import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useBlockLabel } from '@/components/source/BlockLabel';
import type { ReviewBlock } from '@/features/review/queue';
import { cn } from '@/lib/cn';

type BlockQueueListProps = {
  blocks: ReviewBlock[];
  current: string | null;
  onSelect: (id: string) => void;
};

/** The page's blocks to review: approved, now, or waiting, and how many problems wait in each. */
export function BlockQueueList({ blocks, current, onSelect }: BlockQueueListProps) {
  const { t } = useTranslation();
  const blockLabel = useBlockLabel();
  return (
    <ul className="flex flex-col gap-0.5">
      {blocks.map((b) => {
        const now = b.id === current;
        return (
          <li key={b.id}>
            <button
              type="button"
              aria-current={now ? 'step' : undefined}
              onClick={() => onSelect(b.id)}
              className={cn(
                'flex min-h-10 w-full cursor-pointer items-center gap-2 rounded-[10px] px-2.5 text-left text-[13px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                now
                  ? 'bg-secondary font-sans-black text-foreground'
                  : 'text-foreground hover:bg-muted',
                b.approved && !now && 'text-success',
              )}
            >
              {b.approved ? (
                <Check className="size-4 shrink-0 text-success" strokeWidth={2.6} aria-hidden />
              ) : (
                <span
                  aria-hidden
                  className={cn(
                    'size-4 shrink-0 rounded-full border-2',
                    now ? 'border-primary' : 'border-border',
                  )}
                />
              )}
              <span className="w-7 shrink-0 font-mono text-[11px] text-muted-foreground">
                {b.id}
              </span>
              <span className="min-w-0 flex-1 truncate">
                {b.block ? blockLabel(b.block) : t('review.unknownBlock')}
              </span>
              {b.approved ? (
                <span className="text-[11px] font-sans-black">{t('review.approvedShort')}</span>
              ) : b.problems ? (
                <span className="text-[11px] font-sans-black text-destructive">
                  {t('review.problems', { count: b.problems })}
                </span>
              ) : now ? (
                <span className="text-[11px] font-sans-black text-primary">{t('review.now')}</span>
              ) : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
