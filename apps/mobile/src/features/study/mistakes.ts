import type {
  MathSvg,
  MistakeGroup as WorldMistakeGroup,
  PracticeTest,
  Question,
  TestResult,
} from '@mytutor/types';
import { isCorrect, rightAnswer } from '@/features/tests/answers';
import type { MistakeGroup, MistakeItem } from './types';

/** The test made of the student's mistakes ("Hamısını təkrarla"). */
export const MISTAKES_TEST_ID = 'mistakes';

/** A review run takes at most this many questions. */
export const MISTAKES_TEST_SIZE = 10;

export type MistakeEntry = {
  question: Question;
  answer: string | undefined;
  /** The test the question belongs to (not the review run it was last answered in). */
  test: PracticeTest;
  finishedAt: string;
};

/**
 * Questions whose latest answer is wrong, newest first. A question answered right later (for
 * example in a review run) leaves the list by itself.
 */
export function collectMistakes(
  results: TestResult[],
  tests: Record<string, PracticeTest>,
): MistakeEntry[] {
  const index = new Map<string, { question: Question; test: PracticeTest }>();
  for (const test of Object.values(tests)) {
    for (const question of test.questions) {
      if (!index.has(question.id)) index.set(question.id, { question, test });
    }
  }
  // Results are newest first, so the first answer met for a question is its latest one.
  const latest = new Map<string, { answer: string; finishedAt: string }>();
  for (const result of results) {
    for (const [id, answer] of Object.entries(result.answers)) {
      if (!latest.has(id)) latest.set(id, { answer, finishedAt: result.finishedAt });
    }
  }
  return [...latest].flatMap(([id, { answer, finishedAt }]) => {
    const hit = index.get(id);
    if (!hit || isCorrect(hit.question, answer)) return [];
    return [{ question: hit.question, test: hit.test, answer, finishedAt }];
  });
}

/** "C · 8x³ + 12x² + 6x + 1" for an option, the number as typed for an open question. */
export function answerText(question: Question, answer: string | undefined): string {
  if (!answer) return '';
  if (question.type !== 'choice') return answer;
  const option = question.options.find((o) => o.key === answer);
  return option ? `${answer} · ${option.text}` : answer;
}

const toItem = (entry: MistakeEntry): MistakeItem => ({
  id: entry.question.id,
  stem: entry.question.stem,
  yours: answerText(entry.question, entry.answer),
  right: answerText(entry.question, rightAnswer(entry.question)),
  source: entry.question.source,
  explanation: entry.question.explanation,
  subjectId: entry.test.subjectId,
  finishedAt: entry.finishedAt,
});

/** Mistakes by the test (topic) they come from, in the order first met. */
export function groupMistakes(entries: MistakeEntry[]): MistakeGroup[] {
  const groups = new Map<string, MistakeGroup>();
  for (const entry of entries) {
    const group = groups.get(entry.test.id) ?? {
      id: entry.test.id,
      topicId: entry.test.topicId,
      title: entry.test.title,
      cell: 'needs_practice' as const,
      items: [],
      math: entry.test.math,
    };
    group.items.push(toItem(entry));
    groups.set(entry.test.id, group);
  }
  return [...groups.values()];
}

/**
 * The device's mistake groups first, then the demo world's; a world group about the same topic
 * as a device group takes the device's items first (one group per topic, no item twice).
 */
export function mergeMistakes(device: MistakeGroup[], world: WorldMistakeGroup[]): MistakeGroup[] {
  const merged: MistakeGroup[] = device.map((g) => ({ ...g, items: [...g.items] }));
  for (const group of world) {
    const same = merged.find((g) => g.topicId === group.topicId);
    if (!same) {
      merged.push(group);
      continue;
    }
    same.title = group.title;
    same.cell = group.cell;
    same.math = { ...group.math, ...same.math };
    const seen = new Set(same.items.map((i) => i.id));
    same.items.push(...group.items.filter((i) => !seen.has(i.id)));
  }
  return merged;
}

/** A practice test of the newest mistakes; null when there is nothing to practise. */
export function buildMistakesTest(entries: MistakeEntry[], title: string): PracticeTest | null {
  const picked = entries.slice(0, MISTAKES_TEST_SIZE);
  const first = picked[0];
  if (!first) return null;
  const math: Record<string, MathSvg> = {};
  for (const entry of picked) Object.assign(math, entry.test.math);
  return {
    id: MISTAKES_TEST_ID,
    topicId: MISTAKES_TEST_ID,
    subjectId: first.test.subjectId,
    title,
    questions: picked.map((e) => e.question),
    math,
  };
}
