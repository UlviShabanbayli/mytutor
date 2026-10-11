import { BrainCircuit, MousePointerClick } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { KnowledgeDocument, TopicSource } from '@mytutor/types';
import { Card, EmptyState } from '@/components/ui';
import { filterItems, type KnowledgeFilter } from '@/features/knowledge/items';
import { useSearchParam } from '@/lib/useSearchParam';
import { ItemSourcePanel } from './ItemSourcePanel';
import { KnowledgeFilters } from './KnowledgeFilters';
import { KnowledgeItemCard } from './KnowledgeItemCard';
import { KnowledgeStats } from './KnowledgeStats';

type KnowledgeTabProps = { doc: KnowledgeDocument; source: TopicSource; topicDir: string };

export function KnowledgeTab({ doc, source, topicDir }: KnowledgeTabProps) {
  const { t } = useTranslation();
  const [itemId, setParams] = useSearchParam('item');
  const [filter, setFilter] = useState<KnowledgeFilter>({
    status: null,
    type: null,
    failedOnly: false,
  });
  const items = filterItems(doc.items, filter);
  const selected = doc.items.find((i) => i.id === itemId) ?? null;
  const select = (id: string) => setParams({ item: id });

  return (
    <div className="flex flex-col gap-4">
      <KnowledgeStats doc={doc} />
      <p className="text-xs text-muted-foreground">
        {t('knowledge.meta', {
          extract: doc.prompts.extract,
          verify: doc.prompts.verify,
          models: [...new Set(doc.aiCalls.map((c) => c.model))].join(', '),
          date: new Date(doc.createdAt).toLocaleString('az-AZ'),
        })}
      </p>
      <KnowledgeFilters items={doc.items} filter={filter} onChange={setFilter} />

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)]">
        <div className="flex min-w-0 flex-col gap-3">
          {items.length ? (
            items.map((item) => (
              <KnowledgeItemCard
                key={item.id}
                item={item}
                source={source}
                active={item.id === itemId}
                onSelect={select}
              />
            ))
          ) : (
            <EmptyState icon={<BrainCircuit className="size-6" />} title={t('knowledge.noItems')} />
          )}
        </div>
        <Card className="p-4 lg:sticky lg:top-20 lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto">
          {selected ? (
            <ItemSourcePanel
              key={selected.id}
              item={selected}
              source={source}
              topicDir={topicDir}
            />
          ) : (
            <EmptyState
              className="border-none py-6"
              icon={<MousePointerClick className="size-6" />}
              title={t('knowledge.selectItem')}
              body={t('knowledge.selectItemBody')}
            />
          )}
        </Card>
      </div>
    </div>
  );
}
