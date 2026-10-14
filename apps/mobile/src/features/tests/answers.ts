import type { Question } from '@mytutor/types';

/** A typed number: spaces gone, a decimal comma or point, a leading plus dropped. */
function numberOf(text: string): number | null {
  const clean = text.replace(/\s+/g, '').replace(/^\+/, '').replace(',', '.');
  return /^-?\d+(?:\.\d+)?$/.test(clean) ? Number(clean) : null;
}

/** Whether the student's answer is right: the option for a choice, the number for an open one. */
export function isCorrect(question: Question, answer: string | undefined): boolean {
  if (answer === undefined) return false;
  if (question.type === 'choice') return answer === question.correctKey;
  const given = numberOf(answer);
  const expected = question.answer === null ? null : numberOf(question.answer);
  return given !== null && expected !== null && Math.abs(given - expected) < 1e-9;
}

/** The right answer as the student sees it: "B" or "2,8". */
export const rightAnswer = (question: Question) =>
  (question.type === 'choice' ? question.correctKey : question.answer) ?? '';
