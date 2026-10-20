import { ageGroupOfAccount, demoAccountFor } from './demoAccounts';

describe('demo accounts', () => {
  it('find the role and world of a demo phone, and nothing for any other number', () => {
    expect(demoAccountFor('+994500000004')).toMatchObject({
      role: 'parent',
      persona: 'nermin',
      personId: 'sebine',
    });
    expect(demoAccountFor('+994500000002')).toMatchObject({ role: 'student', persona: 'fresh' });
    expect(demoAccountFor('+994501234567')).toBeNull();
  });

  it('keep only the age group: students are teens, teachers and parents adults', () => {
    const nermin = demoAccountFor('+994500000001');
    const lale = demoAccountFor('+994500000003');
    expect(nermin && ageGroupOfAccount(nermin)).toBe('teen');
    expect(lale && ageGroupOfAccount(lale)).toBe('adult');
  });
});
