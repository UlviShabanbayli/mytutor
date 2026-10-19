import { ImageIcon, Sigma, TriangleAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { SourceBlockKind } from '@mytutor/types';
import { CATEGORIES, categoryTone } from '@/components/source/categoryTone';
import { Badge } from '@/components/ui';
import { categoryOf } from '@/features/source/blocks';
import { cn } from '@/lib/cn';
import { GuideSection } from './GuideSection';

const KINDS: SourceBlockKind[] = [
  'title',
  'inquiry',
  'section',
  'example',
  'theorem',
  'think',
  'remember',
  'find_mistake',
  'history',
  'keywords',
  'exercises',
  'problems',
  'exercise',
  'callout',
];

const frame = (className: string) => (
  <span aria-hidden className={cn('h-7 w-16 rounded-sm border-primary', className)} />
);

export function SourceGuide() {
  const { t } = useTranslation();
  return (
    <GuideSection
      id="source"
      title={t('guide.source.title')}
      intro={t('guide.source.intro')}
      rows={[
        {
          sample: (
            <span className="flex gap-1.5 text-xs text-muted-foreground">
              {t('source.stats.pages')} · {t('source.stats.blocks')} · {t('source.stats.lines')} ·{' '}
              {t('source.stats.figures')} · {t('source.stats.warnings')}
            </span>
          ),
          text: t('guide.source.stats'),
        },
        { sample: frame('border'), text: t('guide.source.solid') },
        { sample: frame('border border-dashed'), text: t('guide.source.dashed') },
        {
          sample: frame('border-2 bg-primary/20 ring-2 ring-primary'),
          text: t('guide.source.selected'),
        },
        {
          sample: (
            <span className="flex flex-wrap gap-1">
              {CATEGORIES.map((c) => (
                <Badge key={c} tone={categoryTone[c]}>
                  {t(`source.category.${c}`)}
                </Badge>
              ))}
            </span>
          ),
          text: t('guide.source.kinds'),
        },
        ...KINDS.map((kind) => ({
          sample: <Badge tone={categoryTone[categoryOf(kind)]}>{t(`source.kind.${kind}`)}</Badge>,
          text: t(`guide.source.kind.${kind}`),
        })),
        {
          sample: <Badge icon={<Sigma className="size-3" />}>{t('source.flags.hasMath')}</Badge>,
          text: t('guide.source.hasMath'),
        },
        {
          sample: (
            <Badge icon={<ImageIcon className="size-3" />}>{t('source.flags.hasFigure')}</Badge>
          ),
          text: t('guide.source.hasFigure'),
        },
        {
          sample: (
            <Badge tone="accent" icon={<TriangleAlert className="size-3" />}>
              {t('source.flags.lowTextQuality')}
            </Badge>
          ),
          text: t('guide.source.lowQuality'),
        },
        { sample: <Badge>{t('source.math')}</Badge>, text: t('guide.source.mathLine') },
        {
          sample: <Badge tone="accent">{t('source.lowQuality')}</Badge>,
          text: t('guide.source.weakLine'),
        },
        {
          sample: (
            <span className="font-mono text-xs text-muted-foreground">b01 · l001 · f01 · k001</span>
          ),
          text: t('guide.source.ids'),
        },
      ]}
    />
  );
}
