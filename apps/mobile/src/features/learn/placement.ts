import type { Hive, PlacementAnswer, PlacementOutcome, PlacementQuestion } from './types';

/*
 * "Bilirəm, yoxla" (architecture Ş3): an adaptive check that finds where to start. It begins in
 * the middle unit; a unit passes when every one of its questions is right, and fails at the
 * first wrong answer or "Bilmirəm". A pass moves up a unit, a fail moves down, until the border
 * between known and unknown is found. Units below a passed unit count as known, units above a
 * failed one as not known. Moves to packages/learning with the real placement API.
 */

type Verdict = 'pass' | 'fail';

export type PlacementStep = {
  /** The next question, or null when the check is over. */
  next: PlacementQuestion | null;
  /** Unit index of the next question (for "Səviyyə: 4-cü çərçivə"). */
  unitIndex: number | null;
  verdicts: (Verdict | undefined)[];
};

function groupByUnit(hive: Hive, questions: PlacementQuestion[]): PlacementQuestion[][] {
  return hive.units.map((u) => questions.filter((q) => q.unitId === u.id));
}

const isRight = (q: PlacementQuestion, answers: PlacementAnswer[]) =>
  answers.find((a) => a.questionId === q.id)?.choice === q.answer;

/** Replays the answers given so far and returns the next question to ask. */
export function placementStep(
  hive: Hive,
  questions: PlacementQuestion[],
  answers: PlacementAnswer[],
): PlacementStep {
  const byUnit = groupByUnit(hive, questions);
  const verdicts: (Verdict | undefined)[] = byUnit.map(() => undefined);
  const known = (u: number) =>
    verdicts[u] !== undefined ||
    verdicts.some((v, i) => (v === 'pass' && i > u) || (v === 'fail' && i < u));

  let u = Math.floor((byUnit.length - 1) / 2);
  while (u >= 0 && u < byUnit.length && !known(u)) {
    let verdict: Verdict = 'pass';
    for (const question of byUnit[u] ?? []) {
      const answer = answers.find((a) => a.questionId === question.id);
      if (!answer) return { next: question, unitIndex: u, verdicts };
      if (answer.choice !== question.answer) {
        verdict = 'fail';
        break;
      }
    }
    verdicts[u] = verdict;
    u = verdict === 'pass' ? u + 1 : u - 1;
  }
  return { next: null, unitIndex: null, verdicts };
}

/** What the check found: known topics (they become Bal) and the start point. */
export function placementOutcome(
  hive: Hive,
  questions: PlacementQuestion[],
  answers: PlacementAnswer[],
): PlacementOutcome {
  const { verdicts } = placementStep(hive, questions, answers);
  const highestPass = verdicts.lastIndexOf('pass');
  const knownTopicIds: string[] = [];
  hive.units.forEach((unit, i) => {
    if (i <= highestPass) knownTopicIds.push(...unit.topics.map((t) => t.id));
    else if (i === highestPass + 1) {
      // The border unit: the topics answered right before the first miss are known.
      for (const topic of unit.topics) {
        const question = questions.find((q) => q.topicId === topic.id);
        if (!question || !isRight(question, answers)) break;
        knownTopicIds.push(topic.id);
      }
    }
  });
  const start = hive.units.flatMap((u) => u.topics).find((t) => !knownTopicIds.includes(t.id));
  const asked = new Set(questions.map((q) => q.id));
  const given = answers.filter((a) => asked.has(a.questionId));
  return {
    answered: given.length,
    correct: given.filter((a) => questions.find((q) => q.id === a.questionId)?.answer === a.choice)
      .length,
    knownTopicIds,
    startTopicId: start?.id ?? null,
  };
}

/** Fewest and most questions the check can ask (shown as "təxminən 3–9 sual"). */
export function placementRange(hive: Hive, questions: PlacementQuestion[]) {
  const sizes = groupByUnit(hive, questions).map((g) => g.length);
  const mid = Math.floor((sizes.length - 1) / 2);
  const sum = (from: number, to: number) => sizes.slice(from, to).reduce((a, b) => a + b, 0);
  // Fewest: one miss per unit from the middle down to the first unit.
  const min = mid + 1;
  // Most: every question from the middle up, or every unit below the middle answered in full.
  const max = Math.max(sum(mid, sizes.length), sum(0, mid + 1));
  return { min, max };
}
