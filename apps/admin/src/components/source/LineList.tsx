import { useTranslation } from 'react-i18next';
import type { SourceLine } from '@mytutor/types';
import { Badge } from '@/components/ui';
import { cn } from '@/lib/cn';

type LineListProps = { lines: SourceLine[]; highlight?: string[] };

/** Text-layer lines with their IDs; low-quality lines are marked so nobody trusts them blindly. */
export function LineList({ lines, highlight = [] }: LineListProps) {
  const { t } = useTranslation();
  return (
    <ol className="flex flex-col divide-y divide-border rounded-sm border border-border">
      {lines.map((line) => (
        <li
          key={line.id}
          className={cn(
            'flex items-start gap-2 px-2 py-1.5 text-sm',
            highlight.includes(line.id) && 'bg-secondary',
          )}
        >
          <code className="mt-0.5 shrink-0 font-mono text-[11px] text-muted-foreground">
            {line.id}
          </code>
          <span
            className={cn(
              'min-w-0 flex-1 break-words',
              line.quality === 'low' ? 'text-muted-foreground' : 'text-foreground',
            )}
          >
            {line.text}
          </span>
          <span className="flex shrink-0 gap-1">
            {line.math ? <Badge>{t('source.math')}</Badge> : null}
            {line.quality === 'low' ? <Badge tone="accent">{t('source.lowQuality')}</Badge> : null}
          </span>
        </li>
      ))}
    </ol>
  );
}
