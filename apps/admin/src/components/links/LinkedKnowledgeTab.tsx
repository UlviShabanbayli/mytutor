import type { KnowledgeDocument, TopicSource } from '@mytutor/types';
import { KnowledgeTab } from '@/components/knowledge/KnowledgeTab';
import { resolveItemLinks } from '@/features/curriculum/links';
import type { BookCurriculum } from '@/features/curriculum/useBookCurriculum';
import { ItemStandards } from './ItemStandards';
import { OrphanLinks } from './OrphanLinks';

type LinkedKnowledgeTabProps = {
  doc: KnowledgeDocument;
  source: TopicSource;
  topicDir: string;
  topic: string;
  bc: BookCurriculum;
};

/** The Bilik tab with each item's curriculum standards, when the book has a curriculum. */
export function LinkedKnowledgeTab({ doc, source, topicDir, topic, bc }: LinkedKnowledgeTabProps) {
  const curriculum = bc.curriculum;
  if (!curriculum) return <KnowledgeTab doc={doc} source={source} topicDir={topicDir} />;
  const mine = bc.links.items.filter((link) => link.topic === topic);
  const { byItem, orphans } = resolveItemLinks(mine, doc.items);
  return (
    <KnowledgeTab
      doc={doc}
      source={source}
      topicDir={topicDir}
      notice={<OrphanLinks orphans={orphans} curriculum={curriculum} bc={bc} />}
      itemStandards={(item) => (
        <ItemStandards
          topic={topic}
          item={item}
          items={doc.items}
          codes={byItem.get(item.id) ?? []}
          curriculum={curriculum}
          bc={bc}
        />
      )}
    />
  );
}
