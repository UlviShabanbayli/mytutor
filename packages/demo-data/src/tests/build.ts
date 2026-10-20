import { OPTION_KEYS } from '@mytutor/schemas';
import type { OptionKey, Question, SourceRef } from '@mytutor/types';
import { READY_BOOK, readyTopic } from '../curriculum';
import { r7 } from '../ids';

/** Builders for demo questions: our own simple maths, each source marked `demo`. */

export const questionSource = (topicId: string): SourceRef => {
  const topic = readyTopic(topicId);
  return {
    kind: 'textbook',
    title: READY_BOOK,
    grade: 7,
    section: `${topic.number} · demo sual`,
    page: topic.pages.start,
    demo: true,
  };
};

type Five = [string, string, string, string, string];

/** A five-option question of topic `number` ("4.3"), the n-th of its test. */
export function choice(
  number: string,
  n: number,
  stem: string,
  options: Five,
  correctKey: OptionKey,
  explanation: string | null = null,
): Question {
  const topicId = r7(number);
  return {
    id: `q-${number.replace('.', '-')}-${n}`,
    topicId,
    type: 'choice',
    stem,
    options: options.map((text, i) => ({ key: OPTION_KEYS[i] ?? 'A', text })),
    correctKey,
    answer: null,
    explanation,
    figures: [],
    source: questionSource(topicId),
  };
}

/** A question answered with a typed number. */
export function open(
  number: string,
  n: number,
  stem: string,
  answer: string,
  explanation: string | null,
): Question {
  const topicId = r7(number);
  return {
    id: `q-${number.replace('.', '-')}-${n}`,
    topicId,
    type: 'open',
    stem,
    options: [],
    correctKey: null,
    answer,
    explanation,
    figures: [],
    source: questionSource(topicId),
  };
}
