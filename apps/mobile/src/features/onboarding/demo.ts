import type { ExamKind } from '@mytutor/types';
import type { LinkedChild } from './types';

/**
 * Demo data until the exam calendar API (architecture Ş7) and the parent link API
 * (architecture V1, /v1/parent/links) exist. Day counts are demo counters, not official dates.
 */

const DEMO_DAYS_LEFT: Record<ExamKind, number> = {
  graduation_9: 142,
  graduation_11: 156,
  admission: 184,
};

/** The one child code the demo knows (the design's demo student). */
const DEMO_CHILD_CODES: Record<string, LinkedChild> = {
  K7Q42M: { name: 'Nərmin', grade: 7 },
};

export type ExamCountdown = { daysLeft: number; estimated: boolean };

export async function fetchExamCountdown(exam: ExamKind): Promise<ExamCountdown> {
  return { daysLeft: DEMO_DAYS_LEFT[exam], estimated: true };
}

export async function lookupChildCode(code: string): Promise<LinkedChild | null> {
  return DEMO_CHILD_CODES[code] ?? null;
}
