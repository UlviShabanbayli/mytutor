import type { KnowledgeDocument, TopicSource } from '@mytutor/types';
import { KnowledgeTab } from '@/components/knowledge/KnowledgeTab';
import { resolveItemLinks } from '@/features/standards/links';
import type { BookStandards } from '@/features/standards/useBookStandards';
import { ItemStandards } from './ItemStandards';
import { OrphanLinks } from './OrphanLinks';

type LinkedKnowledgeTabProps = {
  doc: KnowledgeDocument;
  source: TopicSource;
  topicDir: string;
  topic: string;
  bs: BookStandards;
};

/** The Bilik tab with each item's standard set standards, when the book has a standard set. */
export function LinkedKnowledgeTab({ doc, source, topicDir, topic, bs }: LinkedKnowledgeTabProps) {
  const standardSet = bs.standardSet;
  if (!standardSet) return <KnowledgeTab doc={doc} source={source} topicDir={topicDir} />;
  const mine = bs.links.items.filter((link) => link.topic === topic);
  const { byItem, orphans } = resolveItemLinks(mine, doc.items);
  return (
    <KnowledgeTab
      doc={doc}
      source={source}
      topicDir={topicDir}
      notice={<OrphanLinks orphans={orphans} standardSet={standardSet} bs={bs} />}
      itemStandards={(item) => (
        <ItemStandards
          topic={topic}
          item={item}
          items={doc.items}
          codes={byItem.get(item.id) ?? []}
          standardSet={standardSet}
          bs={bs}
        />
      )}
    />
  );
}
