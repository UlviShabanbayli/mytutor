import type { AskEvent, AskQuestion, SolutionStep } from '@mytutor/types';
import type { Clock } from '../clock';
import { CLASS_7B, LALE, R7 } from '../ids';

/** Builders for the scripted photo questions (nothing here calls an AI). */

export const step = (id: string, text: string, formula: string): SolutionStep => ({
  id,
  text,
  formula,
});

/** sent → AI → (teacher) → answered, `minutes` before now for each event given. */
export function timeline(clock: Clock, sent: number, ai?: number, answered?: number): AskEvent[] {
  const events: AskEvent[] = [{ event: 'sent', at: clock.ago(sent) }];
  if (ai !== undefined) events.push({ event: 'ai_solved', at: clock.ago(ai) });
  if (answered !== undefined) events.push({ event: 'answered', at: clock.ago(answered) });
  return events;
}

export const DAY = 24 * 60;

type Draft = Omit<AskQuestion, 'studentId' | 'subjectId' | 'photoUri' | 'similar'> &
  Partial<Pick<AskQuestion, 'similar'>>;

export const ask = (studentId: string, q: Draft): AskQuestion => ({
  studentId,
  subjectId: R7,
  photoUri: null,
  similar: [],
  ...q,
});

export const fromClass = { classId: CLASS_7B, queue: 'teacher' as const, teacherId: LALE };
