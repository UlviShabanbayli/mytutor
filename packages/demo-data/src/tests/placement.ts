import type { PlacementQuestion } from '@mytutor/types';
import { r7, r7Unit } from '../ids';

/** Placement check: one short question of our own for each of a unit's first three topics. */

const q = (number: string, prompt: string, options: string[], answer: number) => ({
  id: `pq-${number.replace('.', '-')}`,
  unitId: r7Unit(number.split('.')[0] ?? ''),
  topicId: r7(number),
  prompt,
  options,
  answer,
});

export const PLACEMENT: PlacementQuestion[] = [
  q('1.1', 'Hansı ədəd rasional ədəddir?', ['√2', 'π', '−3/4', '√5', '√3'], 2),
  q('1.2', '3/5 kəsrini onluq kəsr şəklində yazın.', ['0,35', '0,6', '0,53', '3,5', '0,06'], 1),
  q(
    '1.3',
    'Hansı bərabərsizlik doğrudur?',
    ['−2 > −1', '−0,5 < −0,7', '−1/2 > −1/3', '−3 < −2', '0 < −1'],
    3,
  ),
  q('2.1', '2⁴ neçəyə bərabərdir?', ['8', '6', '16', '32', '24'], 2),
  q('2.2', 'a³ · a⁵ ifadəsini sadələşdirin.', ['a⁸', 'a¹⁵', 'a²', '2a⁸', 'a⁶'], 0),
  q('2.3', '(2x)³ ifadəsini sadələşdirin.', ['2x³', '6x³', '8x³', '8x', '6x'], 2),
  q('3.1', '3a · 4a² birhədlisini standart şəklə salın.', ['7a³', '12a²', '12a³', '7a²', '12a'], 2),
  q(
    '3.2',
    '2x + 3y − x + y çoxhədlisini sadələşdirin.',
    ['x + 4y', '3x + 4y', 'x + 2y', 'x − 4y', '2x + 4y'],
    0,
  ),
  q(
    '3.3',
    '(5a + 2) + (3a − 7) cəmini tapın.',
    ['8a + 9', '8a − 5', '2a − 5', '8a − 9', '15a − 14'],
    1,
  ),
  q(
    '4.1',
    '(y + 4)² ifadəsini çoxhədli şəklində yazın.',
    ['y² + 16', 'y² + 8y + 16', 'y² + 4y + 16', 'y² − 8y + 16', '2y + 8'],
    1,
  ),
  q(
    '4.2',
    '(a − 5)(a + 5) hasilini tapın.',
    ['a² − 25', 'a² + 25', 'a² − 10a + 25', 'a² − 5', '2a − 25'],
    0,
  ),
  q(
    '4.3',
    'Cəmin kubu düsturu ilə (b + 1)³ ifadəsini açın.',
    ['b³ + 1', 'b³ + 3b² + 3b + 1', 'b³ + 3b + 1', 'b³ + b² + b + 1', '3b³ + 1'],
    1,
  ),
  q(
    '5.1',
    'Kəsişən iki düz xəttin qonşu bucaqlarından biri 40°-dir. O biri neçə dərəcədir?',
    ['40°', '50°', '140°', '180°', '320°'],
    2,
  ),
  q(
    '5.2',
    'Qabarıq dördbucaqlının daxili bucaqlarının cəmi neçə dərəcədir?',
    ['180°', '270°', '360°', '540°', '720°'],
    2,
  ),
  q(
    '5.3',
    'Paraleloqramın bir bucağı 70°-dir. Ona qonşu bucaq neçə dərəcədir?',
    ['70°', '90°', '110°', '140°', '290°'],
    2,
  ),
];
