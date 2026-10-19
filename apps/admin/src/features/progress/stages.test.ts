import { describe, expect, it } from 'vitest';
import type { ContentBookEntry, ContentTopicEntry, TextbookStructure } from '@mytutor/types';
import { searchTopics, topicUrl } from './search';
import { bookStats, bookUnits, missingSources, nextReviewTopic, topicStage } from './stages';

const entry = (number: string, extra: Partial<ContentTopicEntry> = {}): ContentTopicEntry => ({
  number,
  dir: `b/topics/${number}`,
  source: `b/topics/${number}/source.json`,
  knowledge: null,
  summary: null,
  review: null,
  ...extra,
});
const summary = { items: 10, textbook: 8, derived: 1, unverified: 1, flagged: 3, costUsd: 0.5 };
const progress = (approvedBlocks: number, decidedItems: number, blocks = 4, openFlagged = 2) => ({
  blocks,
  approvedBlocks,
  decidedItems,
  openFlagged,
});
const withKnowledge = (number: string, review = progress(0, 0)) =>
  entry(number, { knowledge: `b/topics/${number}/knowledge/knowledge.json`, summary, review });

describe('topicStage', () => {
  it('follows the pipeline from no source to approved', () => {
    expect(topicStage(undefined)).toBe('none');
    expect(topicStage(entry('1.1'))).toBe('source');
    expect(topicStage(withKnowledge('1.1'))).toBe('knowledge');
    expect(topicStage(withKnowledge('1.1', progress(0, 1)))).toBe('review');
    expect(topicStage(withKnowledge('1.1', progress(4, 10)))).toBe('approved');
  });
});

const topic = (number: string) => ({
  type: 'topic' as const,
  number,
  title: `Mövzu ${number}`,
  startPage: 1,
  endPage: 2,
  sections: [],
});
const structure = {
  source: { file: 'b.pdf', pageCount: 10, printedPageOffset: 0 },
  units: [
    { index: 1, title: 'Bir', startPage: 1, endPage: 5, items: [topic('1.1'), topic('1.2')] },
    { index: 2, title: 'İki', startPage: 6, endPage: 9, items: [topic('2.1'), topic('2.2')] },
  ],
  backMatter: [],
  validation: { tocTopicCounts: [], detectedTopicCounts: [], warnings: [] },
} as unknown as TextbookStructure;
const book: ContentBookEntry = {
  id: 'b',
  file: 'b.pdf',
  title: 'Riyaziyyat 7',
  structure: 'b/structure.json',
  answers: null,
  canExtract: true,
  standardLinks: null,
  topics: [entry('1.1'), withKnowledge('1.2'), withKnowledge('2.1', progress(1, 3))],
};

describe('books', () => {
  const units = bookUnits(book, structure);
  const topics = units.flatMap((u) => u.topics);

  it('lists every topic of the structure with its stage', () => {
    expect(topics.map((t) => `${t.number}:${t.stage}`)).toEqual([
      '1.1:source',
      '1.2:knowledge',
      '2.1:review',
      '2.2:none',
    ]);
    expect(missingSources(topics).map((t) => t.number)).toEqual(['2.2']);
  });

  it('counts the book and picks the review to continue first', () => {
    expect(bookStats(topics)).toEqual({
      topics: 4,
      withSource: 3,
      withKnowledge: 2,
      inReview: 1,
      approved: 0,
      items: 20,
      costUsd: 1,
      openFlagged: 4,
    });
    expect(nextReviewTopic(topics)?.number).toBe('2.1');
  });

  it('finds topics by number or title words and opens them at the right step', () => {
    const library = [{ book, topics, title: 'Riyaziyyat 7' }];
    expect(searchTopics(library, '2.').map((h) => h.topic.number)).toEqual(['2.1', '2.2']);
    expect(searchTopics(library, 'mövzu 1.2').map((h) => h.topic.number)).toEqual(['1.2']);
    const [t11, t12, , t22] = topics;
    expect(t11 && topicUrl('b', t11)).toBe('/books/b/topics/1.1/source');
    expect(t12 && topicUrl('b', t12)).toBe('/books/b/topics/1.2/review');
    expect(t22 && topicUrl('b', t22)).toBe('/books/b');
  });
});
