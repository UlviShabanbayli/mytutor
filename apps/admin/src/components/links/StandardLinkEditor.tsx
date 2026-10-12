import { Link2, Pencil } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CurriculumLinksInput, CurriculumStandard } from '@mytutor/types';
import { Button } from '@/components/ui';
import type { BookCurriculum } from '@/features/curriculum/useBookCurriculum';
import { cn } from '@/lib/cn';
import { LinkedStandards } from './LinkedStandards';
import { StandardPickerDialog } from './StandardPickerDialog';

type StandardLinkEditorProps = {
  /** Shown in the picker: what the standards are linked to. */
  subject: string;
  codes: string[];
  standards: CurriculumStandard[];
  save: BookCurriculum['save'];
  /** The book's links with this topic's or item's codes replaced. */
  apply: (codes: string[]) => CurriculumLinksInput;
  compact?: boolean;
  className?: string;
};

/** Linked standards of one topic or knowledge item, and the button that changes them. */
export function StandardLinkEditor({
  subject,
  codes,
  standards,
  save,
  apply,
  compact = false,
  className,
}: StandardLinkEditorProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const close = () => {
    save.reset();
    setOpen(false);
  };

  return (
    <div className={cn('flex min-w-0 flex-col gap-2', className)}>
      {codes.length ? (
        <LinkedStandards codes={codes} standards={standards} compact={compact} />
      ) : null}
      <Button
        variant={codes.length ? 'ghost' : 'secondary'}
        className={cn('self-start', compact ? 'min-h-8 px-2 text-xs' : 'min-h-9 px-3 text-xs')}
        disabled={save.isPending}
        onClick={() => {
          save.reset();
          setOpen(true);
        }}
      >
        {codes.length ? <Pencil className="size-3.5" /> : <Link2 className="size-4" />}
        {codes.length ? t('links.change') : t('links.link')}
        <span className="sr-only"> ({subject})</span>
      </Button>
      <StandardPickerDialog
        open={open}
        subject={subject}
        standards={standards}
        selected={codes}
        pending={save.isPending}
        error={save.error}
        onSave={(next) => save.mutate(apply(next), { onSuccess: close })}
        onClose={close}
      />
    </div>
  );
}
