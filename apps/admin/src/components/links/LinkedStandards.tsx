import { useTranslation } from 'react-i18next';
import type { CurriculumStandard } from '@mytutor/types';
import { cn } from '@/lib/cn';

type LinkedStandardsProps = {
  codes: string[];
  standards: CurriculumStandard[];
  compact?: boolean;
};

/**
 * Linked standards with their text, so no hovering is needed to know what a code means. A code
 * no longer in the curriculum is shown in red until someone removes the link.
 */
export function LinkedStandards({ codes, standards, compact = false }: LinkedStandardsProps) {
  const { t } = useTranslation();
  const byCode = new Map(standards.map((s) => [s.code, s]));
  return (
    <ul className="flex flex-col gap-1">
      {codes.map((code) => {
        const standard = byCode.get(code);
        return (
          <li key={code} className="flex min-w-0 items-start gap-2 text-sm">
            <span
              className={cn(
                'mt-0.5 shrink-0 rounded-sm px-1.5 py-0.5 font-mono text-xs',
                standard
                  ? 'bg-secondary text-secondary-foreground'
                  : 'bg-destructive-muted text-destructive',
              )}
            >
              {code}
            </span>
            <span
              className={cn(
                'min-w-0',
                standard ? 'text-foreground' : 'text-destructive',
                compact && 'line-clamp-2 text-xs',
              )}
            >
              {standard ? standard.text : t('picker.removedText')}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
