import { useTranslation } from 'react-i18next';
import { BasicsGuide } from '@/components/guide/BasicsGuide';
import { BooksGuide } from '@/components/guide/BooksGuide';
import { ChecksGuide } from '@/components/guide/ChecksGuide';
import { StandardsGuide } from '@/components/guide/StandardsGuide';
import { KnowledgeGuide } from '@/components/guide/KnowledgeGuide';
import { ReviewGuide } from '@/components/guide/ReviewGuide';
import { SourceGuide } from '@/components/guide/SourceGuide';
import { WorkflowGuide } from '@/components/guide/WorkflowGuide';
import { usePageCrumbs } from '@/features/layout/crumbs';
import { STANDARDS_ENABLED } from '@/lib/features';

/** What everything in the panel means, each mark shown as it looks. */
export function GuidePage() {
  const { t } = useTranslation();
  usePageCrumbs([{ label: t('nav.overview'), to: '/' }, { label: t('nav.guide') }]);
  const parts = [
    { id: 'workflow', label: t('guide.workflow.title') },
    { id: 'basics', label: t('guide.basics.title') },
    { id: 'books', label: t('guide.books.title') },
    { id: 'review', label: t('guide.review.title') },
    { id: 'source', label: t('guide.source.title') },
    { id: 'knowledge', label: t('guide.knowledge.title') },
    { id: 'checks', label: t('guide.checks.title') },
    ...(STANDARDS_ENABLED
      ? [
          { id: 'standards', label: t('guide.standards.title') },
          { id: 'links', label: t('guide.links.title') },
        ]
      : []),
  ];

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="font-sans-black text-3xl text-foreground">{t('guide.title')}</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">{t('guide.subtitle')}</p>
      </header>
      <nav aria-label={t('guide.toc')} className="flex flex-wrap gap-2">
        {parts.map((part) => (
          <a
            key={part.id}
            href={`#${part.id}`}
            className="inline-flex min-h-9 items-center rounded-full border border-border bg-card px-3 font-sans-bold text-xs text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {part.label}
          </a>
        ))}
      </nav>
      <WorkflowGuide />
      <BasicsGuide />
      <BooksGuide />
      <ReviewGuide />
      <SourceGuide />
      <KnowledgeGuide />
      <ChecksGuide />
      {STANDARDS_ENABLED ? <StandardsGuide /> : null}
    </div>
  );
}
