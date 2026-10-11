import { Check, Wrench, X } from 'lucide-react';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { REVIEW_NOTE_MAX } from '@mytutor/schemas';
import type { ReviewDecision } from '@mytutor/types';
import { Button, Textarea } from '@/components/ui';

type DecisionButtonsProps = { onDecide: (decision: ReviewDecision, note: string | null) => void };

/** Approve, ask for a fix (with what to fix), or reject; one click each, the note only for fixes. */
export function DecisionButtons({ onDecide }: DecisionButtonsProps) {
  const { t } = useTranslation();
  const noteId = useId();
  const [fixing, setFixing] = useState(false);
  const [note, setNote] = useState('');

  if (fixing)
    return (
      <form
        className="flex flex-col gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (note.trim()) onDecide('needs_fix', note.trim());
        }}
      >
        <label htmlFor={noteId} className="text-[13px] font-sans-bold text-foreground">
          {t('review.fixLabel')}
        </label>
        <Textarea
          id={noteId}
          autoFocus
          rows={2}
          maxLength={REVIEW_NOTE_MAX}
          value={note}
          placeholder={t('review.fixPlaceholder')}
          onChange={(e) => setNote(e.target.value)}
        />
        <div className="flex flex-wrap gap-1.5">
          <Button type="submit" disabled={!note.trim()}>
            {t('review.fixSave')}
          </Button>
          <Button variant="ghost" onClick={() => setFixing(false)}>
            {t('review.cancel')}
          </Button>
        </div>
      </form>
    );

  return (
    <div className="flex flex-wrap gap-1.5">
      <Button onClick={() => onDecide('approved', null)}>
        <Check className="size-4" />
        {t('review.approve')}
      </Button>
      <Button variant="secondary" onClick={() => setFixing(true)}>
        <Wrench className="size-4" />
        {t('review.needsFix')}
      </Button>
      <Button
        variant="secondary"
        className="border-destructive/40 text-destructive hover:bg-destructive-muted"
        onClick={() => onDecide('rejected', null)}
      >
        <X className="size-4" />
        {t('review.reject')}
      </Button>
    </div>
  );
}
