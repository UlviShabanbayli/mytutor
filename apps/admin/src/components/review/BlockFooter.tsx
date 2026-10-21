import { Check, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui';

type BlockFooterProps = {
  blockId: string;
  approved: boolean;
  itemCount: number;
  /** Items with no decision yet. */
  open: number;
  /** Undecided items confirmed as printed with every check passed: approvable together. */
  clean: number;
  next: string | null;
  onApproveClean: () => void;
  onApprove: () => void;
  onReopen: () => void;
  onNext: () => void;
};

/** "Approve the block" once every item is decided; afterwards, take it back or go on. */
export function BlockFooter(props: BlockFooterProps) {
  const { t } = useTranslation();
  const { approved, open, clean, next } = props;
  if (approved)
    return (
      <div
        role="status"
        className="flex flex-wrap items-center gap-3 rounded-md bg-success-muted p-3.5 text-success"
      >
        <Check className="size-5 shrink-0" strokeWidth={2.6} aria-hidden />
        <span className="flex-[1_1_16rem] font-sans-black text-[15px]">
          {t('review.blockDone', { id: props.blockId })}
        </span>
        <Button variant="secondary" onClick={props.onReopen}>
          {t('review.undo')}
        </Button>
        {next ? (
          <Button onClick={props.onNext}>
            {t('review.nextBlock', { id: next })}
            <ChevronRight className="size-4" />
          </Button>
        ) : null}
      </div>
    );

  return (
    <footer className="flex flex-wrap items-center gap-2.5 border-t border-border pt-3.5">
      <span
        className={`flex-[1_1_15rem] text-[13px] font-sans-bold ${open ? 'text-muted-foreground' : 'text-success'}`}
      >
        {open ? t('review.openLeft', { count: open }) : t('review.allDecided')}
      </span>
      {clean > 1 ? (
        <Button variant="secondary" onClick={props.onApproveClean}>
          {t('review.approveClean', { count: clean })}
        </Button>
      ) : null}
      {next ? (
        <Button variant="secondary" onClick={props.onNext}>
          {t('review.later')}
        </Button>
      ) : null}
      <Button disabled={open > 0} onClick={props.onApprove}>
        {t('review.approveBlock', { count: props.itemCount })}
      </Button>
    </footer>
  );
}
