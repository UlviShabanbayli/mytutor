import type { BankQuestion } from '@mytutor/types';

/** Rough time a student needs per question, for the "~12 dəq" estimate. */
export const MINUTES_PER_QUESTION = 3;

export function toggleId(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
}

/** Selected questions per topic id, e.g. { 'riyaziyyat-7-4-1': 2, 'riyaziyyat-7-4-2': 2 }. */
export function countByTopic(selected: string[], bank: BankQuestion[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const q of bank) {
    if (selected.includes(q.id)) counts[q.topicId] = (counts[q.topicId] ?? 0) + 1;
  }
  return counts;
}

export function estimateMinutes(questionCount: number): number {
  return questionCount * MINUTES_PER_QUESTION;
}

/** A test goes to the catalog only with questions and the teacher's rights confirmed (M3). */
export function canSubmitTest(count: number, audience: 'class' | 'catalog', rights: boolean) {
  return count > 0 && (audience === 'class' || rights);
}
