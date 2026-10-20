import type { BankQuestion, DemoWorld } from '@mytutor/types';
import { demoSource } from '../curriculum';
import { CLASS_7B, r7 } from '../ids';

/** Our question bank for the teacher's test builder, and what most of 7B got wrong. */

const BANK: [id: string, topic: string, text: string][] = [
  ['b-4-1-1', '4.1', '(x + 4)² ifadəsini çoxhədli kimi yazın.'],
  ['b-4-1-2', '4.1', '(3a − 2b)² ifadəsini çoxhədli kimi yazın.'],
  ['b-4-1-3', '4.1', '102² qiymətini düsturla hesablayın.'],
  ['b-4-1-4', '4.1', '(y − 6)² ifadəsini açın.'],
  ['b-4-2-1', '4.2', '(x − 3)(x + 3) hasilini tapın.'],
  ['b-4-2-2', '4.2', '51 · 49 hasilini düsturla hesablayın.'],
  ['b-4-2-3', '4.2', '(2m + 5)(2m − 5) hasilini çoxhədli kimi yazın.'],
  ['b-4-3-1', '4.3', '(a + 2)³ ifadəsini çoxhədli kimi yazın.'],
  ['b-4-3-2', '4.3', '(x − 1)³ açılışını yazın.'],
  ['b-4-4-1', '4.4', 'ax + ay ifadəsini vuruqlara ayırın.'],
  ['b-4-4-2', '4.4', '6x² − 9x ifadəsini vuruqlara ayırın.'],
  ['b-4-5-1', '4.5', 'x² − 49 ifadəsini vuruqlara ayırın.'],
  ['b-4-5-2', '4.5', 'a² + 6a + 9 ifadəsini vuruqlara ayırın.'],
];

export const bank = (): BankQuestion[] =>
  BANK.map(([id, topic, text]) => ({
    id,
    topicId: r7(topic),
    text,
    source: demoSource(r7(topic), 'demo sual'),
  }));

export const missed = (): DemoWorld['missed'] => [
  {
    classId: CLASS_7B,
    id: 'missed-4-2',
    text: '(x − 3)(x + 3) = ?',
    source: demoSource(r7('4.2'), 'demo sual'),
    wrong: 14,
    total: 24,
  },
  {
    classId: CLASS_7B,
    id: 'missed-4-1',
    text: '(3a − 2b)² açılışı',
    source: demoSource(r7('4.1'), 'demo sual'),
    wrong: 11,
    total: 24,
  },
];
