/**
 * The subjects a photo question can be filed under, and their ids in the demo world
 * ("riyaziyyat-7"): the subject's slug and the grade. Only maths has the student's own class
 * teacher in the demo; the rest go to the general queue.
 */
export const ASK_SUBJECT_IDS = [
  'math',
  'azLang',
  'english',
  'physics',
  'biology',
  'history',
  'chemistry',
  'geography',
] as const;

export type AskSubjectId = (typeof ASK_SUBJECT_IDS)[number];

/** The subject the student's classes teach (every demo class is a maths class). */
export const CLASS_SUBJECT_ID: AskSubjectId = 'math';

const SLUGS: Record<AskSubjectId, string> = {
  math: 'riyaziyyat',
  azLang: 'azerbaycan-dili',
  english: 'ingilis-dili',
  physics: 'fizika',
  biology: 'biologiya',
  history: 'tarix',
  chemistry: 'kimya',
  geography: 'cografiya',
};

/** `math`, 7 → "riyaziyyat-7". */
export const worldSubjectId = (subject: AskSubjectId, grade: number) =>
  `${SLUGS[subject]}-${grade}`;

/** "fizika-9" → { subject: 'physics', grade: 9 }; null for an id of another form. */
export function askSubjectOf(id: string): { subject: AskSubjectId; grade: number } | null {
  const match = /^(.+)-(\d{1,2})$/.exec(id);
  if (!match) return null;
  const subject = ASK_SUBJECT_IDS.find((s) => SLUGS[s] === match[1]);
  return subject ? { subject, grade: Number(match[2]) } : null;
}

/** Typical answer times shown to the student, in minutes (the demo's promise, not a rule). */
export const ANSWER_MINUTES = { teacher: 15, general: 30 } as const;
