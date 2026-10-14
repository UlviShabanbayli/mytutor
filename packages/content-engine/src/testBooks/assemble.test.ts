import { describe, expect, it } from 'vitest';
import type { PageReading } from '@mytutor/types';
import { assemble, matchAnswers, parsePairs, printedOffset, titleSimilarity } from './assemble';

type Question = PageReading['questions'][number];

const question = (number: number, fields: Partial<Question> = {}): Question => ({
  number,
  subsection: '',
  written: false,
  situation: '',
  type: 'choice',
  stem: `Sual ${number}`,
  options: ['A', 'B', 'C', 'D', 'E'].map((key) => ({ key, text: key.toLowerCase() })),
  left: [],
  right: [],
  bands: [`L${number}`],
  figureBands: [],
  continues: 'no',
  unclear: '',
  ...fields,
});

const page = (printedPage: number, fields: Partial<PageReading>): PageReading => ({
  kind: 'questions',
  printedPage,
  headings: [],
  situations: [],
  questions: [],
  answerTables: [],
  ...fields,
});

const SUB_A = 'Natural ədədlərin toplanması, çıxılması, vurulması və bölünməsi';
const SUB_B = 'Natural ədədlərin bölünmə alamətləri. Qalıqlı bölmə';

const readings = new Map<number, PageReading>([
  [
    2,
    page(4, {
      headings: [
        { level: 'section', text: 'Natural ədədlər' },
        { level: 'subsection', text: SUB_A },
      ],
      questions: [
        question(1, { subsection: SUB_A }),
        question(2, { subsection: SUB_A, continues: 'to_next_page', options: [] }),
      ],
    }),
  ],
  [
    3,
    // The page number is not printed here; the others give the offset.
    page(0, {
      headings: [{ level: 'subsection', text: SUB_B }],
      questions: [
        question(0, {
          stem: '',
          continues: 'from_previous_page',
          options: ['A', 'B', 'C', 'D', 'E'].map((key) => ({ key, text: key })),
        }),
        question(3),
        question(1, {
          subsection: SUB_B,
          type: 'matching',
          options: [],
          left: [
            { key: '1', text: 'x' },
            { key: '2', text: 'y' },
          ],
          right: [],
        }),
      ],
    }),
  ],
  [
    10,
    page(12, {
      kind: 'answers',
      answerTables: [
        {
          section: 'Natural ədədlər',
          subsection: 'Natural ədədlərin toplanması, çıxılması, vurulması və bölünməsi',
          answers: [
            { number: 1, answer: 'B' },
            { number: 2, answer: 'E' },
            { number: 3, answer: '35' },
          ],
        },
        {
          section: '',
          subsection: SUB_B,
          answers: [
            { number: 1, answer: 'c; a, e' },
            { number: 9, answer: 'D' },
          ],
        },
      ],
    }),
  ],
]);

describe('assemble', () => {
  const { drafts, key } = assemble(readings, [2, 3, 10]);

  it('carries headings over pages and joins a question that runs over a page', () => {
    expect(drafts.map((d) => [d.subsection, d.number])).toEqual([
      [SUB_A, 1],
      [SUB_A, 2],
      [SUB_A, 3],
      [SUB_B, 1],
    ]);
    expect(drafts[1]?.pages.map((p) => p.page)).toEqual([2, 3]);
    expect(drafts[1]?.options).toHaveLength(5);
    // Page 3 printed no number: it is 5, as the other pages' offset says.
    expect(drafts[1]?.pages[1]?.printedPage).toBe(5);
    expect(printedOffset(readings)).toBe(2);
  });

  it('matches the key by subsection and number, and checks each answer fits its question', () => {
    const left = matchAnswers(drafts, key);
    expect(drafts.map((d) => d.answer?.printed)).toEqual(['B', 'E', '35', 'c; a, e']);
    expect(drafts[0]?.answer).toMatchObject({ choice: 'B', page: 10, printedPage: 12 });
    expect(drafts[3]?.answer?.pairs).toEqual({ 1: ['c'], 2: ['a', 'e'] });
    // Question 3 has options but its answer is a number: flagged for the editor.
    expect(drafts[2]?.flags).toContain('answer_type');
    expect(left.map((e) => e.number)).toEqual([9]);
  });
});

describe('helpers', () => {
  it('reads matching answers only when every item has letters', () => {
    expect(parsePairs('b; c; a, e', 3)).toEqual({ 1: ['b'], 2: ['c'], 3: ['a', 'e'] });
    expect(parsePairs('b; c', 3)).toBeNull();
    expect(parsePairs('12; c; a', 3)).toBeNull();
  });

  it('finds a title printed a little differently', () => {
    const full =
      'Natural ədədlərin sadə vuruqlara ayrılışı. Ən böyük ortaq bölən (ƏBOB). Ən kiçik ortaq bölünən (ƏKOB)';
    expect(
      titleSimilarity(
        full,
        'Natural ədədlərin sadə vuruqlara ayrılışı. Ən böyük ortaq bölən (ƏBOB).',
      ),
    ).toBeGreaterThan(0.5);
    expect(titleSimilarity(full, SUB_B)).toBeLessThan(0.3);
  });
});
