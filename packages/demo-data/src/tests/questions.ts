import type { Question } from '@mytutor/types';
import { choice, open } from './build';

/** Three demo questions per unit-4 topic. Every answer is checked by hand and by the tests. */
export const QUESTIONS: Record<string, Question[]> = {
  '4.1': [
    choice(
      '4.1',
      1,
      '(x + 3)² ifadəsini çoxhədli şəklində yaz.',
      ['x² + 9', 'x² + 3x + 9', 'x² + 6x + 9', 'x² + 6x + 3', 'x² − 6x + 9'],
      'C',
      'a = x, b = 3 götür: x² + 2 · x · 3 + 3² = x² + 6x + 9.',
    ),
    choice(
      '4.1',
      2,
      '(a − 3)² ifadəsini çoxhədli şəklində yaz.',
      ['a² − 9', 'a² − 6a + 9', 'a² + 6a + 9', 'a² − 3a + 9', 'a² − 6a − 9'],
      'B',
    ),
    open(
      '4.1',
      3,
      '102² ifadəsinin qiymətini (100 + 2)² kimi hesabla.',
      '10404',
      '100² + 2 · 100 · 2 + 2² = 10000 + 400 + 4 = 10404.',
    ),
  ],
  '4.2': [
    choice(
      '4.2',
      1,
      '(x − 4)(x + 4) hasilini tap.',
      ['x² + 16', 'x² − 8x + 16', 'x² − 16', '2x − 16', 'x² − 8'],
      'C',
      '(a − b)(a + b) = a² − b²: x² − 4² = x² − 16.',
    ),
    choice(
      '4.2',
      2,
      '(2m + 5)(2m − 5) hasilini çoxhədli şəklində yaz.',
      ['4m² − 25', '4m² + 25', '2m² − 25', '4m² − 10m − 25', '4m² − 5'],
      'A',
    ),
    open(
      '4.2',
      3,
      '51 · 49 hasilini düsturla hesabla.',
      '2499',
      '(50 + 1)(50 − 1) = 50² − 1² = 2500 − 1 = 2499.',
    ),
  ],
  '4.3': [
    choice(
      '4.3',
      1,
      '(x + 2)³ ifadəsini çoxhədli şəklində yaz.',
      [
        'x³ + 8',
        'x³ + 2x² + 4x + 8',
        'x³ + 6x² + 12x + 8',
        'x³ + 12x² + 6x + 8',
        'x³ + 6x² + 6x + 8',
      ],
      'C',
      'a = x, b = 2 götür: x³ + 3 · x² · 2 + 3 · x · 2² + 2³ = x³ + 6x² + 12x + 8.',
    ),
    choice(
      '4.3',
      2,
      '(y − 1)³ ifadəsini çoxhədli şəklində yaz.',
      ['y³ − 1', 'y³ − 3y² + 3y − 1', 'y³ + 3y² + 3y − 1', 'y³ − 3y² − 3y − 1', 'y³ − y² + y − 1'],
      'B',
    ),
    open(
      '4.3',
      3,
      'a + b = 4 və ab = 3 olarsa, a³ + b³ ifadəsinin qiymətini tap.',
      '28',
      'a³ + b³ = (a + b)³ − 3ab(a + b) = 64 − 36 = 28.',
    ),
  ],
  '4.4': [
    choice(
      '4.4',
      1,
      '6xy − 9x ifadəsini vuruqlara ayır.',
      ['3(2xy − 3)', '3x(2y − 9)', 'x(6y − 3)', '3y(2x − 3)', '3x(2y − 3)'],
      'E',
      'Ortaq vuruq 3x-dir: 6xy − 9x = 3x(2y − 3).',
    ),
    choice(
      '4.4',
      2,
      'ax + ay + 2x + 2y ifadəsini vuruqlara ayır.',
      ['(x + y)(a + 2)', '(x + 2)(a + y)', 'a(x + y) + 2', '(a + x)(2 + y)', '2a(x + y)'],
      'A',
    ),
    open(
      '4.4',
      3,
      'x = 12 olarsa, x² − 2x ifadəsinin qiymətini tap. Əvvəlcə vuruqlara ayır.',
      '120',
      'x² − 2x = x(x − 2) = 12 · 10 = 120.',
    ),
  ],
  '4.5': [
    choice(
      '4.5',
      1,
      'x² − 25 ifadəsini vuruqlara ayır.',
      ['(x − 5)²', '(x + 5)²', '(x − 5)(x + 5)', '(x − 25)(x + 1)', 'x(x − 25)'],
      'C',
      'Kvadratlar fərqi: x² − 5² = (x − 5)(x + 5).',
    ),
    choice(
      '4.5',
      2,
      '4a² + 4a + 1 ifadəsini vuruqlara ayır.',
      ['(2a + 1)²', '(2a − 1)²', '(4a + 1)²', '(2a + 1)(2a − 1)', '(a + 1)²'],
      'A',
    ),
    open(
      '4.5',
      3,
      '53² − 47² ifadəsinin qiymətini düsturla hesabla.',
      '600',
      '(53 − 47)(53 + 47) = 6 · 100 = 600.',
    ),
  ],
};
