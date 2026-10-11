import {
  BookOpen,
  CircleHelp,
  Clapperboard,
  Copy,
  Inbox,
  LayoutGrid,
  ListChecks,
  Search,
  Trash2,
  TriangleAlert,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CountBadge } from '@/components/layout/CountBadge';
import { Badge, type Tone } from '@/components/ui';
import { dotTone } from '@/components/ui/tones';
import { cn } from '@/lib/cn';
import { GuideSection } from './GuideSection';
import { SampleLabel } from './samples';

const TONES: { tone: Tone; key: 'primary' | 'success' | 'accent' | 'destructive' | 'neutral' }[] = [
  { tone: 'primary', key: 'primary' },
  { tone: 'success', key: 'success' },
  { tone: 'accent', key: 'accent' },
  { tone: 'destructive', key: 'destructive' },
  { tone: 'neutral', key: 'neutral' },
];

export function BasicsGuide() {
  const { t } = useTranslation();
  const nav = (icon: React.ReactNode, label: string) => (
    <>
      <span className="text-muted-foreground">{icon}</span>
      <SampleLabel>{label}</SampleLabel>
    </>
  );
  return (
    <GuideSection
      id="basics"
      title={t('guide.basics.title')}
      rows={[
        {
          sample: nav(<LayoutGrid className="size-4" />, t('nav.overview')),
          text: t('guide.basics.overview'),
        },
        {
          sample: (
            <>
              {nav(<BookOpen className="size-4" />, t('nav.books'))}
              <CountBadge tone="destructive" value={83} />
            </>
          ),
          text: t('guide.basics.books'),
        },
        {
          sample: (
            <>
              {nav(<Inbox className="size-4" />, t('nav.review'))}
              <CountBadge tone="destructive" value={83} />
            </>
          ),
          text: t('guide.basics.review'),
        },
        {
          sample: nav(<ListChecks className="size-4" />, t('nav.standards')),
          text: t('guide.basics.standards'),
        },
        {
          sample: nav(<Clapperboard className="size-4" />, t('nav.lessons')),
          text: t('guide.basics.later'),
        },
        {
          sample: nav(<CircleHelp className="size-4" />, t('nav.guide')),
          text: t('guide.basics.guide'),
        },
        {
          sample: nav(<Trash2 className="size-4" />, t('nav.trash')),
          text: t('guide.basics.trash'),
        },
        {
          sample: (
            <span className="flex gap-3 text-xs font-sans-bold text-muted-foreground">
              <span>{t('theme.system')}</span>
              <span>{t('theme.light')}</span>
              <span>{t('theme.dark')}</span>
            </span>
          ),
          text: t('guide.basics.theme'),
        },
        {
          sample: (
            <span className="flex items-center gap-1.5 rounded-sm border border-border px-2 py-1 text-xs text-muted-foreground">
              <Search className="size-3.5" />
              ⌘K
            </span>
          ),
          text: t('guide.basics.search'),
        },
        ...TONES.map(({ tone, key }) => ({
          sample: (
            <>
              <span className={cn('size-3 rounded-full', dotTone[tone])} aria-hidden />
              <Badge tone={tone}>{t(`guide.colors.${key}`)}</Badge>
            </>
          ),
          text: t(`guide.basics.${key}`),
        })),
        {
          sample: (
            <span className="flex items-center gap-1.5 rounded-md bg-destructive-muted px-2 py-1 text-xs text-destructive">
              <TriangleAlert className="size-3.5" />
              {t('errors.internal')}
            </span>
          ),
          text: t('guide.basics.error'),
        },
        {
          sample: (
            <span className="flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 font-mono text-xs text-foreground">
              pnpm …
              <Copy className="size-3.5 text-muted-foreground" />
            </span>
          ),
          text: t('guide.basics.command'),
        },
      ]}
    />
  );
}
