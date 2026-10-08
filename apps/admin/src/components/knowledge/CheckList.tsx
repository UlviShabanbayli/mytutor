import { CircleCheck, CircleMinus, CircleX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { KnowledgeCheck } from '@mytutor/types';
import { cn } from '@/lib/cn';

const ICON = { pass: CircleCheck, fail: CircleX, skip: CircleMinus } as const;
const COLOR = { pass: 'text-success', fail: 'text-destructive', skip: 'text-muted-foreground' };

export function CheckList({ checks }: { checks: KnowledgeCheck[] }) {
  const { t } = useTranslation();
  return (
    <ul className="flex flex-col gap-1 text-xs">
      {checks.map((check) => {
        const Icon = ICON[check.result];
        return (
          <li key={check.name} className="flex items-start gap-1.5">
            <Icon
              className={cn('mt-0.5 size-3.5 shrink-0', COLOR[check.result])}
              aria-label={t(`knowledge.result.${check.result}`)}
            />
            <span className="min-w-0">
              <span className="font-sans-medium text-foreground">
                {t(`knowledge.check.${check.name}`)}
              </span>
              {check.detail ? (
                <span className="text-muted-foreground"> — {check.detail}</span>
              ) : null}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
