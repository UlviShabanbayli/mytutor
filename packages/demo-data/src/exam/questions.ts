import { OPTION_KEYS } from '@mytutor/schemas';
import type { MockGroup, MockQuestion, OptionKey } from '@mytutor/types';
import { demoSource } from '../curriculum';
import { r7 } from '../ids';

/**
 * Mock questions: the team's own simple practice on Riyaziyyat 7 topics, no textbook or DİM
 * text. Every expression and answer is checked by hand and by the tests.
 */

export const MOCK_GROUPS: MockGroup[] = [
  { id: 'rational', title: 'Rasional ədədlər', short: 'Rasional ədədlər' },
  { id: 'powers', title: 'Natural üstlü qüvvət', short: 'Qüvvət' },
  { id: 'polynomials', title: 'Birhədlilər və çoxhədlilər', short: 'Çoxhədlilər' },
  { id: 'formulas', title: 'Müxtəsər vurma düsturları', short: 'Müxtəsər vurma' },
  { id: 'factoring', title: 'Vuruqlara ayırma', short: 'Vuruqlara ayırma' },
];

type Row = [
  prompt: MockQuestion['prompt'],
  expression: string,
  options: [string, string, string, string, string],
  correctKey: OptionKey,
  groupId: string,
  topic: string,
];

const ROWS: Row[] = [
  ['compute', '−3/4 + 1/2', ['1/4', '−1/4', '−5/4', '−1/2', '5/4'], 'B', 'rational', '1.4'],
  ['compute', '(−2/3) · 9/4', ['−3/2', '3/2', '−2/3', '−27/8', '11/12'], 'A', 'rational', '1.5'],
  ['compute', '0,6 − 1,25', ['0,65', '−0,55', '−1,85', '−0,65', '0,55'], 'D', 'rational', '1.4'],
  ['compute', '(−1,2) : 0,4', ['3', '−0,3', '−3', '−0,48', '0,3'], 'C', 'rational', '1.5'],
  ['compute', '(1/2 − 1/3) · 6', ['2', '5', '−1', '1/6', '1'], 'E', 'rational', '1.6'],
  ['simplify', 'a³ · a⁵', ['a¹⁵', 'a⁸', 'a²', '2a⁸', 'a⁹'], 'B', 'powers', '2.2'],
  ['simplify', 'x¹⁰ : x⁴', ['x⁶', 'x¹⁴', 'x⁴⁰', 'x⁵', '6x'], 'A', 'powers', '2.2'],
  ['simplify', '(b⁴)³', ['b⁷', 'b⁶⁴', '3b⁴', 'b¹²', 'b⁸¹'], 'D', 'powers', '2.2'],
  ['simplify', '(2x²)³', ['6x⁶', '8x⁵', '8x⁶', '2x⁶', '6x⁵'], 'C', 'powers', '2.3'],
  ['compute', '2⁵ − 3²', ['1', '7', '16', '41', '23'], 'E', 'powers', '2.1'],
  ['simplify', '3x² · 4x³', ['12x⁵', '7x⁵', '12x⁶', '7x⁶', '12x'], 'A', 'polynomials', '3.1'],
  [
    'simplify',
    '3a²b · (−2ab)',
    ['6a³b²', '−6a²b', '−6a³b²', 'a³b²', '−6a²b²'],
    'C',
    'polynomials',
    '3.1',
  ],
  [
    'simplify',
    '(5a − 2b) − (3a − 4b)',
    ['2a − 6b', '2a + 2b', '8a − 6b', '2a − 2b', '8a + 2b'],
    'B',
    'polynomials',
    '3.3',
  ],
  [
    'simplify',
    '2x(3x − 5)',
    ['6x² − 5', '6x² − 10', '5x² − 10x', '6x² − 10x', '6x² + 10x'],
    'D',
    'polynomials',
    '3.4',
  ],
  [
    'simplify',
    '(x + 2)(x + 3)',
    ['x² + 6x + 5', 'x² + 6', 'x² + 5x + 5', '2x + 5', 'x² + 5x + 6'],
    'E',
    'polynomials',
    '3.5',
  ],
  [
    'simplify',
    '(a − 1)(a + 4)',
    ['a² + 3a − 4', 'a² − 3a − 4', 'a² + 3a + 4', 'a² − 4', 'a² + 5a − 4'],
    'A',
    'polynomials',
    '3.5',
  ],
  [
    'expand',
    '(2x − 3)²',
    ['4x² − 9', '4x² − 6x + 9', '4x² − 12x + 9', '2x² − 12x + 9', '4x² + 12x + 9'],
    'C',
    'formulas',
    '4.1',
  ],
  [
    'expand',
    '(a + 5)²',
    ['a² + 25', 'a² + 5a + 25', 'a² + 10a + 5', 'a² + 10a + 25', '2a + 10'],
    'D',
    'formulas',
    '4.1',
  ],
  [
    'expand',
    '(3m + 1)²',
    ['9m² + 6m + 1', '9m² + 3m + 1', '3m² + 6m + 1', '9m² + 1', '9m² − 6m + 1'],
    'A',
    'formulas',
    '4.1',
  ],
  [
    'expand',
    '(x − 4)(x + 4)',
    ['x² + 16', 'x² − 8x + 16', 'x² − 8', '2x − 16', 'x² − 16'],
    'E',
    'formulas',
    '4.2',
  ],
  [
    'expand',
    '(y + 2)³',
    ['y³ + 8', 'y³ + 6y² + 12y + 8', 'y³ + 2y² + 4y + 8', 'y³ + 3y² + 3y + 8', 'y³ + 6y² + 6y + 8'],
    'B',
    'formulas',
    '4.3',
  ],
  ['compute', '51² − 49²', ['4', '100', '2', '200', '400'], 'D', 'factoring', '4.5'],
  [
    'factor',
    'x² − 25',
    ['(x − 5)²', '(x + 5)²', '(x − 5)(x + 5)', '(x − 25)(x + 1)', 'x(x − 25)'],
    'C',
    'factoring',
    '4.5',
  ],
  [
    'factor',
    '4a² + 4a + 1',
    ['(2a + 1)²', '(2a − 1)²', '(4a + 1)²', '(2a + 1)(2a − 1)', '(a + 1)²'],
    'A',
    'factoring',
    '4.5',
  ],
  [
    'factor',
    '6xy − 9x',
    ['3(2xy − 3)', '3x(2y − 9)', 'x(6y − 3)', '3y(2x − 3)', '3x(2y − 3)'],
    'E',
    'factoring',
    '4.4',
  ],
];

export const MOCK_QUESTIONS: MockQuestion[] = ROWS.map(
  ([prompt, expression, options, correctKey, groupId, topic], i) => ({
    id: `mq-${i + 1}`,
    prompt,
    expression,
    options: options.map((text, k) => ({ key: OPTION_KEYS[k] ?? 'A', text })),
    correctKey,
    groupId,
    topicId: r7(topic),
    topic,
    source: demoSource(r7(topic), 'demo sual'),
  }),
);
