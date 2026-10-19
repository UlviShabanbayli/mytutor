import type { ContentBookEntry, ContentTopicEntry, TextbookStructure } from '@mytutor/types';

/** Where a topic is on the way from textbook to lesson. */
export type TopicStage = 'none' | 'source' | 'knowledge' | 'review' | 'approved';

export const STAGES: TopicStage[] = ['none', 'source', 'knowledge', 'review', 'approved'];

export function topicStage(entry: ContentTopicEntry | undefined): TopicStage {
  if (!entry) return 'none';
  if (!entry.knowledge || !entry.review) return entry.knowledge ? 'knowledge' : 'source';
  const { blocks, approvedBlocks, decidedItems } = entry.review;
  if (blocks > 0 && approvedBlocks === blocks) return 'approved';
  return approvedBlocks > 0 || decidedItems > 0 ? 'review' : 'knowledge';
}

/** A topic as the book's structure lists it, with what the pipeline made of it. */
export type TopicRowData = {
  number: string;
  title: string;
  startPage: number;
  endPage: number;
  entry: ContentTopicEntry | undefined;
  stage: TopicStage;
};

export type UnitData = {
  index: number;
  title: string;
  startPage: number;
  endPage: number;
  topics: TopicRowData[];
};

/** The book's units with their topics; topics not split yet are absent from the index. */
export function bookUnits(
  book: ContentBookEntry,
  structure: TextbookStructure | undefined,
): UnitData[] {
  if (!structure) return [];
  return structure.units.map((unit) => ({
    index: unit.index,
    title: unit.title,
    startPage: unit.startPage,
    endPage: unit.endPage,
    topics: unit.items.flatMap((item) => {
      if (item.type !== 'topic') return [];
      const entry = book.topics.find((t) => t.number === item.number);
      return [
        {
          number: item.number,
          title: item.title,
          startPage: item.startPage,
          endPage: item.endPage,
          entry,
          stage: topicStage(entry),
        },
      ];
    }),
  }));
}

export type BookStats = {
  topics: number;
  withSource: number;
  withKnowledge: number;
  inReview: number;
  approved: number;
  items: number;
  costUsd: number;
  /** Flagged items with no decision yet. */
  openFlagged: number;
};

export function bookStats(topics: TopicRowData[]): BookStats {
  const count = (stages: TopicStage[]) => topics.filter((t) => stages.includes(t.stage)).length;
  return {
    topics: topics.length,
    withSource: count(['source', 'knowledge', 'review', 'approved']),
    withKnowledge: count(['knowledge', 'review', 'approved']),
    inReview: count(['review']),
    approved: count(['approved']),
    items: topics.reduce((sum, t) => sum + (t.entry?.summary?.items ?? 0), 0),
    costUsd: topics.reduce((sum, t) => sum + (t.entry?.summary?.costUsd ?? 0), 0),
    openFlagged: topics.reduce((sum, t) => sum + (t.entry?.review?.openFlagged ?? 0), 0),
  };
}

export const addStats = (a: BookStats, b: BookStats): BookStats => ({
  topics: a.topics + b.topics,
  withSource: a.withSource + b.withSource,
  withKnowledge: a.withKnowledge + b.withKnowledge,
  inReview: a.inReview + b.inReview,
  approved: a.approved + b.approved,
  items: a.items + b.items,
  costUsd: a.costUsd + b.costUsd,
  openFlagged: a.openFlagged + b.openFlagged,
});

/** The topic to review next: one already started, else the first waiting for review. */
export function nextReviewTopic(topics: TopicRowData[]): TopicRowData | null {
  return (
    topics.find((t) => t.stage === 'review') ?? topics.find((t) => t.stage === 'knowledge') ?? null
  );
}

/** Topics whose source can still be extracted from the PDF. */
export const missingSources = (topics: TopicRowData[]) => topics.filter((t) => t.stage === 'none');
