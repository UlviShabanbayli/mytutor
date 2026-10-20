import type { Question } from '@mytutor/types';
import { choice, open } from './build';

/**
 * Demo questions for the topics review starts with (2.2 and 3.1, Nərmin's crystallized topics):
 * our own simple maths, checked by hand and by the tests.
 */
export const REVIEW_QUESTIONS: Record<string, Question[]> = {
  '2.2': [
    choice(
      '2.2',
      1,
      'a⁴ · a³ ifadəsini sadələşdir.',
      ['a¹²', 'a⁷', 'a', '2a⁷', 'a⁶'],
      'B',
      'Eyni əsaslı qüvvətləri vuranda üstlər toplanır: 4 + 3 = 7.',
    ),
    choice(
      '2.2',
      2,
      'x⁹ : x³ ifadəsini sadələşdir.',
      ['x³', 'x¹²', 'x⁶', 'x²⁷', '3x'],
      'C',
      'Bölmədə üstlər çıxılır: 9 − 3 = 6.',
    ),
    open('2.2', 3, '2⁵ · 2³ : 2⁶ ifadəsinin qiymətini tap.', '4', '2⁵⁺³⁻⁶ = 2² = 4.'),
  ],
  '3.1': [
    choice(
      '3.1',
      1,
      '2a · 5a³ birhədlisini standart şəklə sal.',
      ['7a³', '10a³', '10a⁴', '7a⁴', '10a'],
      'C',
      'Əmsallar vurulur (2 · 5 = 10), üstlər toplanır (1 + 3 = 4).',
    ),
    choice(
      '3.1',
      2,
      '−3x²y · 4xy³ hasilini tap.',
      ['12x³y⁴', '−12x²y³', '−12x³y⁴', 'x³y⁴', '−7x³y⁴'],
      'C',
    ),
    open(
      '3.1',
      3,
      '5ab² birhədlisinin a = 2, b = −1 olduqda qiymətini tap.',
      '10',
      '5 · 2 · (−1)² = 10.',
    ),
  ],
};
