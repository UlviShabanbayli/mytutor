import { useTranslation } from 'react-i18next';
import { dotTone } from '@/components/ui/tones';
import { cn } from '@/lib/cn';
import { CATEGORIES, categoryTone } from './categoryTone';

export function CategoryLegend() {
  const { t } = useTranslation();
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
      {CATEGORIES.map((c) => (
        <li key={c} className="flex items-center gap-1.5">
          <span className={cn('size-2.5 rounded-full', dotTone[categoryTone[c]])} aria-hidden />
          {t(`source.category.${c}`)}
        </li>
      ))}
    </ul>
  );
}
