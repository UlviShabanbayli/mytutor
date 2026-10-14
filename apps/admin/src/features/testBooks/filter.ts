import type { TestQuestion } from '@mytutor/types';

export type QuestionView = 'all' | 'flagged' | 'uncovered' | 'unlinked';

/** The questions a view shows, in book order. */
export function questionsIn(questions: TestQuestion[], view: QuestionView, subsection: string) {
  return questions.filter(
    (q) =>
      (!subsection || q.subsection === subsection) &&
      (view === 'all' ||
        (view === 'flagged' && q.flags.length > 0) ||
        (view === 'uncovered' && q.uncovered !== null) ||
        (view === 'unlinked' && !q.links.some((l) => l.role === 'required'))),
  );
}

/** Subsections in the order the book prints them. */
export const subsectionsOf = (questions: TestQuestion[]) => [
  ...new Set(questions.map((q) => q.subsection)),
];
