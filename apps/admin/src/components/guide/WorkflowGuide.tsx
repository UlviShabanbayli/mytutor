import { BookText, BrainCircuit, Clapperboard, ListChecks, Plus, SearchCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { GuideSection } from './GuideSection';
import { SampleLabel } from './samples';

const step = (n: number, icon: ReactNode, label: string) => (
  <>
    <span className="flex size-7 items-center justify-center rounded-full bg-primary font-sans-black text-xs text-primary-foreground">
      {n}
    </span>
    <span className="text-primary">{icon}</span>
    <SampleLabel>{label}</SampleLabel>
  </>
);

export function WorkflowGuide() {
  const { t } = useTranslation();
  return (
    <GuideSection
      id="workflow"
      title={t('guide.workflow.title')}
      intro={t('guide.workflow.intro')}
      rows={[
        {
          sample: step(1, <Plus className="size-4" />, t('books.add')),
          text: t('guide.workflow.add'),
        },
        {
          sample: step(2, <BookText className="size-4" />, t('topic.tabs.source')),
          text: t('guide.workflow.source'),
        },
        {
          sample: step(3, <BrainCircuit className="size-4" />, t('topic.tabs.knowledge')),
          text: t('guide.workflow.knowledge'),
        },
        {
          sample: step(4, <SearchCheck className="size-4" />, t('nav.review')),
          text: t('guide.workflow.review'),
        },
        {
          sample: step(5, <ListChecks className="size-4" />, t('nav.standards')),
          text: t('guide.workflow.standards'),
        },
        {
          sample: step(6, <Clapperboard className="size-4" />, t('topic.tabs.lesson')),
          text: t('guide.workflow.lesson'),
        },
      ]}
    />
  );
}
