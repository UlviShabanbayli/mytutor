import { normalizeChildCode } from './childCode';
import {
  EXAM_OPTIONS,
  examGoal,
  examOptionKey,
  goalChoiceOf,
  initialExamOption,
} from './examOptions';
import { azLocativeEnding } from './reminder';
import { stepPosition } from './steps';

describe('stepPosition', () => {
  it('places screens on their track', () => {
    expect(stepPosition('lang')).toEqual({ track: 'start', step: 1, total: 5 });
    expect(stepPosition('exam')).toEqual({ track: 'start', step: 4, total: 5 });
    expect(stepPosition('consent')).toEqual({ track: 'account', step: 3, total: 3 });
    expect(stepPosition('teacher')).toEqual({ track: 'teacher', step: 2, total: 4 });
  });
});

describe('exam options', () => {
  it('lists both school-leaving exams and the five admission groups', () => {
    expect(EXAM_OPTIONS.map(examOptionKey)).toEqual([
      'graduation_9',
      'graduation_11',
      'admission_I',
      'admission_II',
      'admission_III',
      'admission_IV',
      'admission_V',
    ]);
  });

  it('starts from the chosen exam, else from the goal and grade', () => {
    const chosen = examGoal({ exam: 'admission', group: 'III' });
    expect(initialExamOption(chosen, 'admission', 11)).toEqual({
      exam: 'admission',
      group: 'III',
    });
    expect(initialExamOption(null, 'admission', 11)).toEqual({ exam: 'admission', group: 'I' });
    expect(initialExamOption(null, 'graduation', 11)).toEqual({
      exam: 'graduation_11',
      group: null,
    });
    expect(initialExamOption(null, 'graduation', 7)).toEqual({
      exam: 'graduation_9',
      group: null,
    });
  });

  it('keeps the exam date unknown', () => {
    expect(examGoal({ exam: 'graduation_9', group: null })).toEqual({
      kind: 'exam',
      exam: 'graduation_9',
      group: null,
      date: null,
    });
  });

  it('restores the goal answer', () => {
    expect(goalChoiceOf(null, 'unsure')).toBe('unsure');
    expect(goalChoiceOf(null, null)).toBe('school');
    expect(goalChoiceOf(examGoal({ exam: 'graduation_11', group: null }), null)).toBe('graduation');
  });
});

describe('azLocativeEnding', () => {
  it.each([
    ['19:00', 'da'],
    ['20:00', 'də'],
    ['21:00', 'də'],
    ['16:00', 'da'],
    ['18:00', 'də'],
    ['18:30', 'da'],
    ['10:00', 'da'],
  ])('%s-%s', (time, ending) => {
    expect(azLocativeEnding(time)).toBe(ending);
  });
});

describe('normalizeChildCode', () => {
  it('upper-cases and drops separators', () => {
    expect(normalizeChildCode('k7q-42m')).toBe('K7Q42M');
    expect(normalizeChildCode('K7Q 42M 99')).toBe('K7Q42M');
  });
});
