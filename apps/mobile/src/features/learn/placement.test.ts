import { demoHive, demoPlacementQuestions } from './demo';
import { placementOutcome, placementRange, placementStep } from './placement';
import type { PlacementAnswer, PlacementQuestion } from './types';

const questions = demoPlacementQuestions;
const byTopic = (n: string) => {
  const found = questions.find((q) => q.id === `pq-${n}`);
  if (!found) throw new Error(`no question for ${n}`);
  return found;
};
const right = (q: PlacementQuestion): PlacementAnswer => ({ questionId: q.id, choice: q.answer });
const wrong = (q: PlacementQuestion): PlacementAnswer => ({
  questionId: q.id,
  choice: (q.answer + 1) % q.options.length,
});

/** Answers the check to the end with a rule per question; returns the answers given. */
function run(rule: (q: PlacementQuestion) => boolean): PlacementAnswer[] {
  const answers: PlacementAnswer[] = [];
  for (let step = placementStep(demoHive, questions, answers); step.next;) {
    answers.push(rule(step.next) ? right(step.next) : wrong(step.next));
    step = placementStep(demoHive, questions, answers);
  }
  return answers;
}

describe('placementStep', () => {
  it('starts in the middle unit with its first question', () => {
    const step = placementStep(demoHive, questions, []);
    expect(step.unitIndex).toBe(2);
    expect(step.next?.id).toBe('pq-3.1');
  });

  it('moves up after a passed unit and down after a miss', () => {
    const up = placementStep(demoHive, questions, ['3.1', '3.2', '3.3'].map(byTopic).map(right));
    expect(up.next?.id).toBe('pq-4.1');
    const down = placementStep(demoHive, questions, [wrong(byTopic('3.1'))]);
    expect(down.next?.id).toBe('pq-2.1');
  });

  it('treats "Bilmirəm" as not known', () => {
    const step = placementStep(demoHive, questions, [{ questionId: 'pq-3.1', choice: null }]);
    expect(step.unitIndex).toBe(1);
  });
});

describe('placementOutcome', () => {
  it('fills what is known up to the first miss (the design: 17 cells, start at 4.3)', () => {
    const answers = [
      ...['3.1', '3.2', '3.3', '4.1', '4.2'].map(byTopic).map(right),
      wrong(byTopic('4.3')),
    ];
    expect(placementStep(demoHive, questions, answers).next).toBeNull();
    const outcome = placementOutcome(demoHive, questions, answers);
    expect(outcome.knownTopicIds).toHaveLength(17);
    expect(outcome.startTopicId).toBe('riyaziyyat-7.4.3');
    expect(outcome).toMatchObject({ answered: 6, correct: 5 });
  });

  it('starts at the first topic when nothing is known, and ends when all is', () => {
    const none = placementOutcome(
      demoHive,
      questions,
      run(() => false),
    );
    expect(none.knownTopicIds).toEqual([]);
    expect(none.startTopicId).toBe('riyaziyyat-7.1.1');
    const all = placementOutcome(
      demoHive,
      questions,
      run(() => true),
    );
    expect(all.knownTopicIds).toHaveLength(26);
    expect(all.startTopicId).toBeNull();
  });
});

describe('placementRange', () => {
  it('bounds every possible run of the check', () => {
    const { min, max } = placementRange(demoHive, questions);
    expect({ min, max }).toEqual({ min: 3, max: 9 });
    // Every right/wrong pattern over the 15 questions.
    const lengths = new Set<number>();
    for (let mask = 0; mask < 2 ** questions.length; mask += 1) {
      lengths.add(run((q) => (mask >> questions.indexOf(q)) % 2 === 1).length);
    }
    expect(Math.min(...lengths)).toBe(min);
    expect(Math.max(...lengths)).toBe(max);
  });
});
