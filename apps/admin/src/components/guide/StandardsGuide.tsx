import { ClipboardPaste, Link2, Link2Off, Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui';
import { GuideSection } from './GuideSection';
import { SampleButton, SampleCode, SampleLabel } from './samples';

export function StandardsGuide() {
  const { t } = useTranslation();
  return (
    <>
      <GuideSection
        id="standards"
        title={t('guide.standards.title')}
        rows={[
          {
            sample: (
              <>
                <Badge tone="primary">{t('standardSets.standards', { count: 120 })}</Badge>
                <Badge tone="success">{t('standardSets.books', { count: 2 })}</Badge>
              </>
            ),
            text: t('guide.standards.card'),
          },
          {
            sample: (
              <SampleButton variant="primary">
                <ClipboardPaste className="size-3.5" />
                {t('standards.paste')}
              </SampleButton>
            ),
            text: t('guide.standards.paste'),
          },
          {
            sample: <Badge tone="success">{t('paste.added', { count: 12 })}</Badge>,
            text: t('guide.standards.added'),
          },
          {
            sample: <Badge tone="accent">{t('paste.updated', { count: 3 })}</Badge>,
            text: t('guide.standards.updated'),
          },
          {
            sample: (
              <>
                <SampleCode>1.1</SampleCode>
                <SampleLabel>…</SampleLabel>
              </>
            ),
            text: t('guide.standards.parent'),
          },
          {
            sample: (
              <span className="pl-5">
                <SampleCode>1.1.1</SampleCode>
              </span>
            ),
            text: t('guide.standards.child'),
          },
          {
            sample: <Pencil className="size-4 text-muted-foreground" />,
            text: t('guide.standards.edit'),
          },
          {
            sample: <Trash2 className="size-4 text-muted-foreground" />,
            text: t('guide.standards.remove'),
          },
          {
            sample: (
              <SampleButton variant="ghost">
                <span className="flex items-center gap-1 text-destructive">
                  <Trash2 className="size-3.5" />
                  {t('standardSets.delete')}
                </span>
              </SampleButton>
            ),
            text: t('guide.standards.deleteStandardSet'),
          },
        ]}
      />
      <GuideSection
        id="links"
        title={t('guide.links.title')}
        intro={t('guide.links.intro')}
        rows={[
          {
            sample: <SampleLabel>{t('links.stats.topics')}</SampleLabel>,
            text: t('guide.links.topics'),
          },
          {
            sample: <SampleLabel>{t('links.stats.covered')}</SampleLabel>,
            text: t('guide.links.covered'),
          },
          {
            sample: <SampleLabel>{t('links.stats.uncovered')}</SampleLabel>,
            text: t('guide.links.uncovered'),
          },
          {
            sample: <SampleLabel>{t('links.stats.items')}</SampleLabel>,
            text: t('guide.links.items'),
          },
          {
            sample: (
              <SampleButton>
                <Link2 className="size-3.5" />
                {t('links.link')}
              </SampleButton>
            ),
            text: t('guide.links.link'),
          },
          { sample: <SampleCode>1.2.3</SampleCode>, text: t('guide.links.code') },
          {
            sample: <SampleCode tone="destructive">1.2.4</SampleCode>,
            text: t('guide.links.removed'),
          },
          {
            sample: <Badge tone="accent">{t('links.notLinked')}</Badge>,
            text: t('guide.links.notLinked'),
          },
          {
            sample: (
              <span className="rounded-full bg-success-muted px-2 py-0.5 font-sans-bold text-xs text-success">
                {t('links.topicChip', { topic: '1.4' })}
              </span>
            ),
            text: t('guide.links.topicChip'),
          },
          {
            sample: (
              <span className="flex items-center gap-1.5 text-sm text-foreground">
                <Link2Off className="size-4 text-accent" />
                {t('links.orphansTitle', { count: 1 })}
              </span>
            ),
            text: t('guide.links.orphan'),
          },
        ]}
      />
    </>
  );
}
