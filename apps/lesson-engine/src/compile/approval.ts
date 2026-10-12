import { itemDecisions, scenarioSources } from '@mytutor/schemas';
import type { KnowledgeDocument, LessonScenario, TopicReview } from '@mytutor/types';

/**
 * Knowledge items a scenario cites that the topic does not have, or that no editor approved.
 * A lesson is built only from approved knowledge; a decision made on an older version of an
 * item does not count (decisions are matched by content, as in the review).
 */
export function unapprovedSources(
  scenario: LessonScenario,
  doc: KnowledgeDocument,
  review: TopicReview | null,
): { missing: string[]; unapproved: string[] } {
  const ids = new Set(doc.items.map((i) => i.id));
  const decisions = itemDecisions(doc.items, review);
  const cited = scenarioSources(scenario);
  return {
    missing: cited.filter((id) => !ids.has(id)),
    unapproved: cited.filter((id) => ids.has(id) && decisions.get(id)?.decision !== 'approved'),
  };
}
