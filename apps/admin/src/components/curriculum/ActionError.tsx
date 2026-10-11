import { TriangleAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { describeActionError } from '@/features/content/errors';
import { cn } from '@/lib/cn';

type ActionErrorProps = { error: unknown; compact?: boolean; className?: string };

/** A failed action in plain words, with the server's message folded away for developers. */
export function ActionError({ error, compact = false, className }: ActionErrorProps) {
  const { t } = useTranslation();
  const { code, detail } = describeActionError(error);
  return (
    <div
      role="alert"
      className={cn(
        'flex min-w-0 items-start gap-2 rounded-md bg-destructive-muted text-sm text-destructive',
        compact ? 'px-2 py-1 text-xs' : 'px-3 py-2',
        className,
      )}
    >
      <TriangleAlert className={cn('mt-0.5 shrink-0', compact ? 'size-3.5' : 'size-4')} />
      <div className="min-w-0 flex-1">
        <p>{t(`errors.${code}`)}</p>
        {detail && !compact ? (
          <details className="pt-1 text-xs">
            <summary className="cursor-pointer select-none">{t('errors.details')}</summary>
            <pre className="whitespace-pre-wrap break-words font-mono">{detail}</pre>
          </details>
        ) : null}
      </div>
    </div>
  );
}
