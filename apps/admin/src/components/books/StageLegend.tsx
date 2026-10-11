import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/cn';
import { STAGE_ORDER, stageFill } from './stageTone';

/** What the colours of the topic cells mean. */
export function StageLegend() {
  const { t } = useTranslation();
  return (
    <ul
      aria-label={t('stage.legend')}
      className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-sans-bold text-muted-foreground"
    >
      {STAGE_ORDER.map((stage) => (
        <li key={stage} className="flex items-center gap-1.5">
          <span className={cn('size-3 rounded-[3px]', stageFill[stage])} aria-hidden />
          {t(`stage.${stage}`)}
        </li>
      ))}
      <li className="flex items-center gap-1.5">
        <span className="size-2 rounded-full bg-destructive" aria-hidden />
        {t('stage.flagged')}
      </li>
    </ul>
  );
}
