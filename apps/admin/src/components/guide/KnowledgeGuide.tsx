import { Camera, FileText, TriangleAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { KnowledgeItemType } from '@mytutor/types';
import { STATUSES, statusTone } from '@/components/knowledge/statusTone';
import { Badge } from '@/components/ui';
import { dotTone } from '@/components/ui/tones';
import { cn } from '@/lib/cn';
import { GuideSection } from './GuideSection';
import { SampleLabel } from './samples';

const TYPES: KnowledgeItemType[] = [
  'definition',
  'rule',
  'formula',
  'worked_example',
  'exercise',
  'question',
  'figure',
  'term',
  'prerequisite',
];

const stat = (label: string, tone?: 'success' | 'accent' | 'destructive') => (
  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
    {tone ? <span className={cn('size-2 rounded-full', dotTone[tone])} aria-hidden /> : null}
    {label}
  </span>
);

export function KnowledgeGuide() {
  const { t } = useTranslation();
  return (
    <GuideSection
      id="knowledge"
      title={t('guide.knowledge.title')}
      intro={t('guide.knowledge.intro')}
      rows={[
        ...STATUSES.map((status) => ({
          sample: <Badge tone={statusTone[status]}>{t(`knowledge.status.${status}`)}</Badge>,
          text: t(`guide.knowledge.${status}`),
        })),
        {
          sample: stat(t('knowledge.stats.failed'), 'destructive'),
          text: t('guide.knowledge.failed'),
        },
        {
          sample: stat(t('knowledge.stats.imageFormulas')),
          text: t('guide.knowledge.imageFormulas'),
        },
        { sample: stat(t('knowledge.stats.aiCalls')), text: t('guide.knowledge.aiCalls') },
        { sample: stat(t('knowledge.stats.cost')), text: t('guide.knowledge.cost') },
        {
          sample: <span className="font-mono text-xs text-primary underline">k001</span>,
          text: t('guide.knowledge.code'),
        },
        ...TYPES.map((type) => ({
          sample: <Badge tone="primary">{t(`knowledge.type.${type}`)}</Badge>,
          text: t(`guide.knowledge.type.${type}`),
        })),
        {
          sample: (
            <Badge icon={<Camera className="size-3" />}>{t('knowledge.readFrom.image')}</Badge>
          ),
          text: t('guide.knowledge.readImage'),
        },
        {
          sample: (
            <Badge icon={<FileText className="size-3" />}>{t('knowledge.readFrom.text')}</Badge>
          ),
          text: t('guide.knowledge.readText'),
        },
        {
          sample: (
            <Badge tone="accent" icon={<TriangleAlert className="size-3" />}>
              {t('knowledge.claimedTextbook')}
            </Badge>
          ),
          text: t('guide.knowledge.claimed'),
        },
        {
          sample: (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-foreground">
              b02 · {t('source.kind.inquiry')} · {t('common.printedPage', { page: 9 })}
            </span>
          ),
          text: t('guide.knowledge.sources'),
        },
        {
          sample: <SampleLabel>{t('knowledge.figures')}</SampleLabel>,
          text: t('guide.knowledge.figures'),
        },
        {
          sample: <SampleLabel>{t('knowledge.selectItem')}</SampleLabel>,
          text: t('guide.knowledge.panel'),
        },
      ]}
    >
      <p className="max-w-3xl rounded-md bg-muted px-4 py-3 text-sm text-foreground">
        {t('guide.knowledge.statusRule')}
      </p>
    </GuideSection>
  );
}
