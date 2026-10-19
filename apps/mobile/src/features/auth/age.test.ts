import type { Role } from '@mytutor/types';
import { ageGroupOf, ageWindow, initialAge, MAX_AGE, MIN_AGE } from './age';

describe('ageGroupOf', () => {
  it.each([
    [7, 'under_13'],
    [12, 'under_13'],
    [13, 'teen'],
    [17, 'teen'],
    [18, 'adult'],
  ])('%i -> %s', (age, group) => {
    expect(ageGroupOf(age)).toBe(group);
  });
});

describe('initialAge', () => {
  it("starts from a student's usual age for the grade", () => {
    expect(initialAge('student', 7)).toBe(12);
    expect(initialAge('student', 11)).toBe(16);
    expect(initialAge('student', null)).toBe(12);
  });

  it.each<Role>(['teacher', 'parent'])('starts adults at 18+ (%s)', (role) => {
    expect(initialAge(role, null)).toBe(MAX_AGE);
  });
});

describe('ageWindow', () => {
  it('centres the selected age', () => {
    expect(ageWindow(12)).toEqual([10, 11, 12, 13, 14]);
  });

  it('keeps the selection centred at the ends', () => {
    expect(ageWindow(MIN_AGE)).toEqual([null, null, MIN_AGE, MIN_AGE + 1, MIN_AGE + 2]);
    expect(ageWindow(MAX_AGE)).toEqual([MAX_AGE - 2, MAX_AGE - 1, MAX_AGE, null, null]);
  });
});
