import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { OfficialStandard } from '@mytutor/types';
import { Button } from '@/components/ui';
import { cn } from '@/lib/cn';
import { StandardForm } from './StandardForm';

type StandardRowProps = {
  standard: OfficialStandard;
  depth: number;
  lines: string[];
  takenCodes: Set<string>;
  busy: boolean;
  onSave: (next: OfficialStandard) => void;
  onDelete: () => void;
};

/** One standard of the editor: read, edit in place, or delete after a second click. */
export function StandardRow({
  standard,
  depth,
  lines,
  takenCodes,
  busy,
  onSave,
  onDelete,
}: StandardRowProps) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'view' | 'edit' | 'delete'>('view');

  if (mode === 'edit') {
    const others = new Set([...takenCodes].filter((c) => c !== standard.code));
    return (
      <li className="px-3 py-2">
        <StandardForm
          initial={standard}
          lines={lines}
          takenCodes={others}
          busy={busy}
          onSubmit={(next) => {
            onSave(next);
            setMode('view');
          }}
          onCancel={() => setMode('view')}
        />
      </li>
    );
  }

  return (
    <li
      className={cn(
        'flex items-start gap-3 px-3 py-2.5',
        depth > 0 && 'pl-8',
        depth > 1 && 'pl-14',
      )}
    >
      <span
        className={cn(
          'mt-0.5 shrink-0 rounded-sm px-1.5 py-0.5 font-mono text-xs tabular-nums',
          depth === 0
            ? 'bg-secondary font-bold text-secondary-foreground'
            : 'bg-muted text-foreground',
        )}
      >
        {standard.code}
      </span>
      <p
        className={cn(
          'min-w-0 flex-1 text-sm',
          depth === 0 ? 'font-sans-bold text-foreground' : 'text-foreground',
        )}
      >
        {standard.text}
      </p>
      {mode === 'delete' ? (
        <span className="flex shrink-0 items-center gap-1">
          <span className="text-xs text-muted-foreground">{t('standards.confirmDelete')}</span>
          <Button
            variant="danger"
            className="min-h-8 px-2 text-xs"
            disabled={busy}
            onClick={onDelete}
          >
            {t('standards.yes')}
          </Button>
          <Button variant="ghost" className="min-h-8 px-2 text-xs" onClick={() => setMode('view')}>
            {t('standards.no')}
          </Button>
        </span>
      ) : (
        <span className="flex shrink-0 gap-0.5">
          <Button
            variant="ghost"
            className="size-9 min-h-9 px-0"
            aria-label={t('standards.editNamed', { code: standard.code })}
            disabled={busy}
            onClick={() => setMode('edit')}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            className="size-9 min-h-9 px-0 hover:bg-destructive-muted hover:text-destructive"
            aria-label={t('standards.deleteNamed', { code: standard.code })}
            disabled={busy}
            onClick={() => setMode('delete')}
          >
            <Trash2 className="size-4" />
          </Button>
        </span>
      )}
    </li>
  );
}
