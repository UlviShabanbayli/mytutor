import type {
  CurriculumLinks,
  CurriculumLinksInput,
  ItemStandardLink,
  KnowledgeItem,
} from '@mytutor/types';

export const emptyLinks = (curriculumId: string | null = null): CurriculumLinksInput => ({
  curriculumId,
  topics: {},
  items: [],
});

/** What the panel sends back: the saved links without the server's stamp. */
export const toInput = (links: CurriculumLinks | CurriculumLinksInput): CurriculumLinksInput => ({
  curriculumId: links.curriculumId,
  topics: links.topics,
  items: links.items,
});

/** Stable JSON: object keys sorted, so equal content always prints the same. */
function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value && typeof value === 'object')
    return `{${Object.keys(value)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${stable((value as Record<string, unknown>)[k])}`)
      .join(',')}}`;
  return JSON.stringify(value) ?? 'null';
}

/** FNV-1a of the item's type and content: finds the item again after ids are renumbered. */
export function fingerprint(item: KnowledgeItem): string {
  let hash = 0x811c9dc5;
  for (const char of `${item.type}|${stable(item.content)}`) {
    hash ^= char.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

export type ResolvedItemLinks = {
  /** Item id → linked codes, for items found by id and content, or by content alone. */
  byItem: Map<string, string[]>;
  /** Links whose item is no longer in the document (its content changed or it is gone). */
  orphans: ItemStandardLink[];
};

/** Matches a topic's item links to the items of its current knowledge document. */
export function resolveItemLinks(
  links: ItemStandardLink[],
  items: KnowledgeItem[],
): ResolvedItemLinks {
  const prints = new Map(items.map((item) => [item.id, fingerprint(item)]));
  const byItem = new Map<string, string[]>();
  const orphans: ItemStandardLink[] = [];
  for (const link of links) {
    const id =
      prints.get(link.itemId) === link.fingerprint
        ? link.itemId
        : [...prints].find(([, print]) => print === link.fingerprint)?.[0];
    if (id === undefined) orphans.push(link);
    else byItem.set(id, [...new Set([...(byItem.get(id) ?? []), ...link.codes])]);
  }
  return { byItem, orphans };
}

/** Sets one topic's standards; an empty list removes the topic's entry. */
export function withTopicCodes(
  links: CurriculumLinksInput,
  topic: string,
  codes: string[],
): CurriculumLinksInput {
  const topics = Object.fromEntries(Object.entries(links.topics).filter(([key]) => key !== topic));
  return { ...links, topics: codes.length ? { ...topics, [topic]: codes } : topics };
}

/**
 * Sets one knowledge item's standards. The topic's other item links are rewritten from the
 * current document, so links found by content alone take their item's new id; orphans stay.
 */
export function withItemCodes(
  links: CurriculumLinksInput,
  topic: string,
  items: KnowledgeItem[],
  itemId: string,
  codes: string[],
): CurriculumLinksInput {
  const mine = links.items.filter((link) => link.topic === topic);
  const { byItem, orphans } = resolveItemLinks(mine, items);
  if (codes.length) byItem.set(itemId, codes);
  else byItem.delete(itemId);
  const current = items.flatMap((item) => {
    const itemCodes = byItem.get(item.id);
    return itemCodes?.length
      ? [{ topic, itemId: item.id, fingerprint: fingerprint(item), codes: itemCodes }]
      : [];
  });
  return {
    ...links,
    items: [...links.items.filter((link) => link.topic !== topic), ...current, ...orphans],
  };
}

/** Drops a link whose item is gone. */
export const withoutItemLink = (
  links: CurriculumLinksInput,
  orphan: ItemStandardLink,
): CurriculumLinksInput => ({ ...links, items: links.items.filter((link) => link !== orphan) });

export type Coverage = {
  /** Standard code → topics linking it (directly or through one of their items). */
  topicsByCode: Map<string, string[]>;
  linkedTopics: number;
  itemLinks: number;
};

export function coverage(links: CurriculumLinksInput): Coverage {
  const topicsByCode = new Map<string, string[]>();
  const add = (code: string, topic: string) => {
    const topics = topicsByCode.get(code) ?? [];
    if (!topics.includes(topic)) topicsByCode.set(code, [...topics, topic]);
  };
  for (const [topic, codes] of Object.entries(links.topics)) for (const c of codes) add(c, topic);
  for (const link of links.items) for (const c of link.codes) add(c, link.topic);
  const linked = new Set([...Object.keys(links.topics), ...links.items.map((l) => l.topic)]);
  return { topicsByCode, linkedTopics: linked.size, itemLinks: links.items.length };
}
