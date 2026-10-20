import type {
  ChainLink,
  CourseTopic,
  MasteryMap,
  MockQuestion,
  MockRun,
  WeakSpotsReport,
} from '@mytutor/types';
import { READY_TOPICS, readyTopic } from '../curriculum';
import { isFilled, levelOf } from '../mastery';

/**
 * Weak spots from mastery and mock errors: topics that need practice, the current one, or
 * those with two or more wrong answers. Each one's chain follows its prerequisites back to the
 * earliest weak topic, the root.
 */

const MAX_SPOTS = 3;
const CHAIN_LENGTH = 4;

/** Wrong answers per topic id across the runs. */
export function errorsByTopic(runs: MockRun[], questions: MockQuestion[]) {
  const errors = new Map<string, number>();
  for (const run of runs)
    for (const q of questions)
      if (run.answers[q.id] !== undefined && run.answers[q.id] !== q.correctKey)
        errors.set(q.topicId, (errors.get(q.topicId) ?? 0) + 1);
  return errors;
}

/** Weak: not mastered or sealed (crystallized honey counts as weak). */
const isWeak = (map: MasteryMap, topicId: string) => {
  const level = levelOf(map, topicId);
  return level === 'needs_practice' || !isFilled(level);
};

function chainOf(topic: CourseTopic, map: MasteryMap, errors: Map<string, number>): ChainLink[] {
  const topics: CourseTopic[] = [topic];
  for (let next = topic; topics.length < CHAIN_LENGTH;) {
    const id = next.prerequisites[0];
    if (!id) break;
    next = readyTopic(id);
    topics.push(next);
  }
  const rootIndex = topics.reduce((root, t, i) => (isWeak(map, t.id) ? i : root), 0);
  return topics.slice(0, rootIndex + 1).map((t, i) => ({
    topicId: t.id,
    topic: t.number,
    title: t.shortTitle,
    grade: 7,
    state: levelOf(map, t.id),
    errors: errors.get(t.id) ?? 0,
    root: i === rootIndex,
    rebuildWith: null,
  }));
}

export function weakSpots(
  map: MasteryMap,
  runs: MockRun[],
  questions: MockQuestion[],
): WeakSpotsReport {
  const errors = errorsByTopic(runs, questions);
  const candidates = READY_TOPICS.filter((t) => {
    const level = levelOf(map, t.id);
    return (
      level === 'needs_practice' || level === 'lesson_completed' || (errors.get(t.id) ?? 0) >= 2
    );
  });
  const ranked = [...candidates]
    .sort((a, b) => (errors.get(b.id) ?? 0) - (errors.get(a.id) ?? 0))
    .slice(0, MAX_SPOTS);
  const spots = ranked.map((t) => {
    const chain = chainOf(t, map, errors);
    const count = errors.get(t.id) ?? 0;
    const fixSteps = chain.filter((l) => isWeak(map, l.topicId ?? '')).length + 1;
    return {
      id: `weak-${t.id}`,
      topicId: t.id,
      topic: t.number,
      title: t.title,
      short: t.shortTitle,
      state: levelOf(map, t.id),
      evidence: {
        kind:
          count >= 3 ? ('recent' as const) : count === 2 ? ('last' as const) : ('some' as const),
        mocks: runs.length,
        errors: count,
      },
      chain,
      fixSteps,
      fixMinutes: fixSteps * 8,
    };
  });
  const roots = spots.map((s) => s.chain[s.chain.length - 1]?.title ?? s.short);
  const commonRoot =
    roots.sort(
      (a, b) => roots.filter((r) => r === b).length - roots.filter((r) => r === a).length,
    )[0] ?? null;
  return {
    mocks: runs.length,
    errors: [...errors.values()].reduce((sum, n) => sum + n, 0),
    commonRoot,
    spots,
  };
}
