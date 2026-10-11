import {
  CircleHelp,
  Copy,
  Library,
  ListChecks,
  Monitor,
  Moon,
  Sun,
  Trash2,
  TriangleAlert,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
          sample: nav(<Library className="size-4" />, t('nav.books')),
          text: t('guide.basics.books'),
        },
        {
          sample: nav(<ListChecks className="size-4" />, t('nav.curricula')),
          text: t('guide.basics.curricula'),
        },
        {
          sample: nav(<Trash2 className="size-4" />, t('nav.trash')),
          text: t('guide.basics.trash'),
        },
        {
          sample: nav(<CircleHelp className="size-4" />, t('nav.guide')),
          text: t('guide.basics.guide'),
        },
        {
          sample: (
            <span className="flex gap-2 text-muted-foreground">
              <Sun className="size-4" />
              <Monitor className="size-4" />
              <Moon className="size-4" />
            </span>
          ),
          text: t('guide.basics.theme'),
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
