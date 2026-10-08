import { BrainCircuit } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CommandHint, EmptyState } from '@/components/ui';
import { commands } from '@/lib/commands';

export function KnowledgeMissing({ topicDir }: { topicDir: string }) {
  const { t } = useTranslation();
  return (
    <EmptyState
      icon={<BrainCircuit className="size-6" />}
      title={t('knowledge.emptyTitle')}
      body={t('knowledge.emptyBody')}
    >
      <CommandHint command={commands.knowledge(topicDir)} />
    </EmptyState>
  );
}
