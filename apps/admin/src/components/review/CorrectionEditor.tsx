import { Check } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { KnowledgeItem } from '@mytutor/types';
import { Button } from '@/components/ui';
import { correctionProblem, FIELDS, fromDraft, toDraft } from '@/features/review/correction';
import { CorrectionField } from './CorrectionField';

type CorrectionEditorProps = {
  item: KnowledgeItem;
  /** What the item says now: the extract, or an earlier correction. */
  content: KnowledgeItem['content'];
  onSave: (content: KnowledgeItem['content']) => void;
  onCancel: () => void;
};

/** Edit the item into what the textbook really says; saving approves the corrected version. */
export function CorrectionEditor({ item, content, onSave, onCancel }: CorrectionEditorProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(() => toDraft(item.type, content));
  const [problem, setProblem] = useState<string | null>(null);

  return (
    <form
      className="flex flex-col gap-3 rounded-md border border-primary/40 bg-card p-3"
      onSubmit={(e) => {
        e.preventDefault();
        const next = fromDraft(item.type, draft);
        const found = correctionProblem(item, next);
        if (found !== null) setProblem(found);
        else onSave(next);
      }}
    >
      <p className="text-xs text-muted-foreground">{t('correction.body')}</p>
      {FIELDS[item.type].map((spec) => (
        <CorrectionField
          key={spec.key}
          spec={spec}
          draft={draft}
          onChange={(value) => {
            setProblem(null);
            setDraft((d) => ({ ...d, [spec.key]: value }));
          }}
        />
      ))}
      {problem !== null ? (
        <p
          role="alert"
          className="rounded-sm bg-destructive-muted px-2 py-1.5 text-xs text-destructive"
        >
          {t('correction.problem', {
            field: t(`correction.field.${problem.split('.')[0] ?? ''}`, { defaultValue: problem }),
          })}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-1.5">
        <Button type="submit">
          <Check className="size-4" />
          {t('correction.save')}
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          {t('review.cancel')}
        </Button>
      </div>
    </form>
  );
}
