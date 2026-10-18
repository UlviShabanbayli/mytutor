import type { Hive, HiveTopic, HiveUnit, MasteryLevel, StepKind, TopicStep } from './types';

/*
 * Mastery rules the screens need. They move to packages/learning with the learning model
 * (architecture "Öyrənmə modeli"); the server stays the source of truth.
 */

const ORDER: MasteryLevel[] = ['not_started', 'lesson_completed', 'mastered', 'reinforced'];

/** A filled cell: the topic was mastered once (crystal still counts, it only needs review). */
export function isFilled(level: MasteryLevel): boolean {
  return level === 'mastered' || level === 'reinforced' || level === 'needs_practice';
}

/** Raises a level to at least `floor`; never lowers it (a check can only add honey). */
export function raiseLevel(level: MasteryLevel, floor: MasteryLevel): MasteryLevel {
  if (level === 'needs_practice') return floor === 'reinforced' ? floor : 'mastered';
  return ORDER.indexOf(floor) > ORDER.indexOf(level) ? floor : level;
}

export function allTopics(hive: Hive): HiveTopic[] {
  return hive.units.flatMap((u) => u.topics);
}

export function hiveCounts(hive: Hive): { filled: number; total: number } {
  const topics = allTopics(hive);
  return { filled: topics.filter((t) => isFilled(t.level)).length, total: topics.length };
}

/** The unit's badge: sealed or honey when every cell is filled, nectar once begun. */
export function unitLevel(unit: HiveUnit): MasteryLevel {
  const levels = unit.topics.map((t) => t.level);
  if (levels.every((l) => l === 'reinforced')) return 'reinforced';
  if (levels.every(isFilled)) return 'mastered';
  return levels.some((l) => l !== 'not_started') ? 'lesson_completed' : 'not_started';
}

export type UnitSummary = {
  filled: number;
  total: number;
  /** Cells that need review. */
  crystals: number;
  /** The unit test was passed. */
  sealed: boolean;
  hasCurrent: boolean;
  /** Any of its topics is saved on the phone. */
  onPhone: boolean;
};

export function unitSummary(unit: HiveUnit, hive: Hive): UnitSummary {
  const levels = unit.topics.map((t) => t.level);
  return {
    filled: levels.filter(isFilled).length,
    total: levels.length,
    crystals: levels.filter((l) => l === 'needs_practice').length,
    sealed: isFilled(unit.unitTest.level),
    hasCurrent: unit.topics.some((t) => t.id === hive.currentTopicId),
    onPhone: unit.topics.some((t) => hive.savedTopicIds.includes(t.id)),
  };
}

export type TopicPlace = { unit: HiveUnit; topic: HiveTopic; index: number; globalIndex: number };

/** Finds a topic by id, or by its textbook number ("4.3") as a short link. */
export function findTopic(hive: Hive, id: string): TopicPlace | null {
  let globalIndex = 0;
  for (const unit of hive.units) {
    for (const [index, topic] of unit.topics.entries()) {
      if (topic.id === id || topic.number === id) return { unit, topic, index, globalIndex };
      globalIndex += 1;
    }
  }
  return null;
}

/** Finds a unit by id, or by its number ("4"). */
export function findUnit(hive: Hive, id: string): { unit: HiveUnit; index: number } | null {
  const index = hive.units.findIndex((u) => u.id === id || u.number === id);
  const unit = hive.units[index];
  return unit ? { unit, index } : null;
}

/** The step "Davam et" opens: the current one, else the first not done, else the test. */
export function nextStep(topic: HiveTopic): StepKind {
  const step =
    topic.steps.find((s) => s.state === 'current') ?? topic.steps.find((s) => s.state === 'todo');
  return step?.kind ?? 'test';
}

export function stepOf(topic: HiveTopic, kind: StepKind): TopicStep | undefined {
  return topic.steps.find((s) => s.kind === kind);
}

export type HiveState = {
  levels: Record<string, MasteryLevel>;
  currentTopicId?: string;
  savedTopicIds: string[];
};

/** The hive with what this device knows on top: placement results, current topic, downloads. */
export function withState(hive: Hive, state: HiveState | undefined): Hive {
  if (!state) return hive;
  return {
    ...hive,
    currentTopicId: state.currentTopicId ?? hive.currentTopicId,
    savedTopicIds: [...new Set([...hive.savedTopicIds, ...state.savedTopicIds])],
    units: hive.units.map((unit) => ({
      ...unit,
      topics: unit.topics.map((t) => {
        const floor = state.levels[t.id];
        if (!floor) return t;
        const level = raiseLevel(t.level, floor);
        // A topic the check filled counts as worked through: its steps are done.
        const steps =
          isFilled(level) && !isFilled(t.level)
            ? t.steps.map((s) => ({ ...s, state: 'done' as const, done: s.total }))
            : t.steps;
        return { ...t, level, steps };
      }),
    })),
  };
}
