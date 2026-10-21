/**
 * LaTeX commands a grade's book should not need yet: a model that misreads a page tends to
 * reach for notation from later grades. Each number is the first grade whose Riyaziyyat
 * textbook uses the idea, counted in our grade 7–11 books on 2026-10-21: roots,
 * trigonometry and ∞ from grade 8, vectors and ∑ from 9, logarithms from 10, limits and
 * integrals from 11. Sets and π already appear in grade 7, so they are not listed (we have no
 * book below grade 7). `null`: no school book uses the command, so it is always a misread.
 */
const FIRST_GRADE = new Map<string, number | null>([
  ['sqrt', 8],
  ['sin', 8],
  ['cos', 8],
  ['tan', 8],
  ['cot', 8],
  ['tg', 8],
  ['ctg', 8],
  ['infty', 8],
  ['vec', 9],
  ['overrightarrow', 9],
  ['sum', 9],
  ['log', 10],
  ['lg', 10],
  ['ln', 10],
  ['lim', 11],
  ['int', 11],
  ['aleph', null],
  ['beth', null],
  ['gimel', null],
  ['mathfrak', null],
  ['mathscr', null],
  ['partial', null],
  ['nabla', null],
  ['oint', null],
  ['iint', null],
  ['iiint', null],
  ['hbar', null],
  ['wp', null],
  ['Re', null],
  ['Im', null],
  ['otimes', null],
  ['oplus', null],
  ['zeta', null],
]);

const COMMAND = /\\([A-Za-z]+)/g;

/** "7-ci", "9-cu", "10-cu": the suffix follows the vowel of the number's last word. */
const SUFFIX = ['', 'ci', 'ci', 'cü', 'cü', 'ci', 'cı', 'ci', 'ci', 'cu', 'cu', 'ci', 'ci'];
export const gradeOrdinal = (grade: number) => `${grade}-${SUFFIX.at(grade) ?? 'ci'}`;

/** What in the LaTeX belongs to a later grade, or to no school grade; empty when nothing. */
export function gradeSymbolProblems(latex: string[], grade: number): string[] {
  const used = new Set(latex.flatMap((l) => [...l.matchAll(COMMAND)].map((m) => m[1] ?? '')));
  return [...used].flatMap((name) => {
    if (!FIRST_GRADE.has(name)) return [];
    const first = FIRST_GRADE.get(name) ?? null;
    if (first === null) return [`\\${name} məktəb riyaziyyatında işlənmir`];
    return first > grade ? [`\\${name} ${gradeOrdinal(first)} sinifdən başlayır`] : [];
  });
}
