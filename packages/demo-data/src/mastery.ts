import { FILLED_LEVELS } from '@mytutor/schemas';
import type { MasteryLevel, MasteryMap } from '@mytutor/types';
import { READY_TOPICS, READY_UNITS } from './curriculum';
import { NERMIN, r7 } from './ids';
import { ROSTER_7B } from './people';

/**
 * The one mastery map. Nərmin: 17 of 26 topics filled (8 reinforced, 7 mastered, 2.2 and 3.1
 * needs_practice), 4.3 lesson_completed as the current topic, 8 not started. Learn, Me, the
 * parent, Today, review, mistakes and the exam's weak spots all read it.
 */

const NERMIN_LEVELS: Record<string, MasteryLevel> = {
  '1.1': 'reinforced',
  '1.2': 'reinforced',
  '1.3': 'reinforced',
  '1.4': 'reinforced',
  '1.5': 'reinforced',
  '1.6': 'reinforced',
  '2.1': 'reinforced',
  '3.3': 'reinforced',
  '2.3': 'mastered',
  '2.4': 'mastered',
  '3.2': 'mastered',
  '3.4': 'mastered',
  '3.5': 'mastered',
  '4.1': 'mastered',
  '4.2': 'mastered',
  '2.2': 'needs_practice',
  '3.1': 'needs_practice',
  '4.3': 'lesson_completed',
};

/** Nərmin's current topic ("Sən buradasan"). */
export const CURRENT_TOPIC = r7('4.3');

export const nerminMastery = (): MasteryMap =>
  Object.fromEntries(Object.entries(NERMIN_LEVELS).map(([n, level]) => [r7(n), level]));

const LETTER: Record<string, MasteryLevel> = {
  M: 'reinforced',
  B: 'mastered',
  N: 'lesson_completed',
  K: 'needs_practice',
};

/** The rest of 7B over unit 4 (4.1–4.5): M reinforced, B mastered, N learning, K practice. */
const UNIT_4_LEVELS: Record<string, string> = {
  orxan: 'KK',
  aysel: 'MBBN',
  tural: 'BKN',
  leyla: 'KK',
  fidan: 'MMBBN',
  sebuhi: 'BKN',
  kamran: 'BK',
  gunay: 'BBN',
  nigar: 'BBN',
  elnur: 'MBN',
  ramil: 'BB',
  murad: 'BB',
  sevinc: 'MBBN',
  lamiye: 'BN',
  zehra: 'BBN',
  nihad: 'BN',
  ilkin: 'B',
  aydan: 'MBN',
  ulviyye: 'BB',
  emil: 'BN',
  rauf: 'BN',
  xedice: 'MBB',
  togrul: 'B',
};

const UNIT_4 = ['4.1', '4.2', '4.3', '4.4', '4.5'];

/** Mastery of every 7B student: Nərmin's whole map, the others' unit 4. */
export function rosterMastery(): Record<string, MasteryMap> {
  const maps: Record<string, MasteryMap> = { [NERMIN]: nerminMastery() };
  for (const [id] of ROSTER_7B) {
    if (id === NERMIN) continue;
    const letters = Array.from(UNIT_4_LEVELS[id] ?? '');
    maps[id] = Object.fromEntries(
      letters.flatMap((letter, i) => {
        const level = LETTER[letter];
        const number = UNIT_4[i];
        return level && number ? [[r7(number), level]] : [];
      }),
    );
  }
  return maps;
}

export const levelOf = (map: MasteryMap, topicId: string): MasteryLevel =>
  map[topicId] ?? 'not_started';

export const isFilled = (level: MasteryLevel) =>
  (FILLED_LEVELS as readonly MasteryLevel[]).includes(level);

/** Topics of the ready volume at each level. */
export function countLevels(map: MasteryMap): Record<MasteryLevel, number> {
  const counts: Record<MasteryLevel, number> = {
    not_started: 0,
    lesson_completed: 0,
    mastered: 0,
    reinforced: 0,
    needs_practice: 0,
  };
  for (const topic of READY_TOPICS) counts[levelOf(map, topic.id)] += 1;
  return counts;
}

export const filledCount = (map: MasteryMap) =>
  READY_TOPICS.filter((t) => isFilled(levelOf(map, t.id))).length;

/** Ready topics at a level, in book order. */
export const topicsAt = (map: MasteryMap, level: MasteryLevel) =>
  READY_TOPICS.filter((t) => levelOf(map, t.id) === level);

const UNIT_SCORE: Partial<Record<MasteryLevel, number>> = {
  reinforced: 1,
  mastered: 0.9,
  needs_practice: 0.6,
};

/**
 * A unit's test result, derived: the unit test is taken once every topic is filled, and its
 * score follows the topics' levels (12 questions, 7 points per right answer).
 */
export function unitResult(map: MasteryMap, unitId: string) {
  const unit = READY_UNITS.find((u) => u.id === unitId);
  if (!unit) return null;
  const levels = unit.topics.map((t) => levelOf(map, t.id));
  if (!levels.every(isFilled)) return null;
  const score = levels.reduce((sum, l) => sum + (UNIT_SCORE[l] ?? 0), 0) / levels.length;
  const correct = Math.round(12 * score);
  return { correct, total: 12, points: correct * 7 };
}

/**
 * Readiness for an exam's maths, derived from mastery: reinforced counts fully, mastered 85%,
 * needs_practice 40%, a finished lesson 25%.
 */
export function readinessPercent(map: MasteryMap): number {
  const weight: Record<MasteryLevel, number> = {
    reinforced: 1,
    mastered: 0.85,
    needs_practice: 0.4,
    lesson_completed: 0.25,
    not_started: 0,
  };
  const sum = READY_TOPICS.reduce((s, t) => s + weight[levelOf(map, t.id)], 0);
  return Math.round((sum / READY_TOPICS.length) * 100);
}
