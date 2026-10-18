import {
  audienceSize,
  classShortName,
  filterMembers,
  makeInviteCode,
  stepValue,
} from './classroom';
import { matchesName } from './people';
import type { ClassMember } from './types';

describe('makeInviteCode', () => {
  it('joins the class, the subject and three unambiguous characters', () => {
    const code = makeInviteCode('7b', 'MATH', () => 0.5);
    expect(code).toMatch(/^7B-MATH-[2-9A-HJKMNP-Z]{3}$/);
  });

  it('never uses 0, O, 1, I or L', () => {
    for (let r = 0; r < 1; r += 0.01) {
      expect(makeInviteCode('7A', 'MATH', () => r)).not.toMatch(/-[^-]*[01OIL][^-]*$/);
    }
  });
});

describe('classShortName', () => {
  it('takes the part before the dot separator', () => {
    expect(classShortName('7B · Riyaziyyat')).toBe('7B');
    expect(classShortName('9a')).toBe('9A');
  });
});

describe('audienceSize', () => {
  const groups = [{ id: 'g', name: 'Qrup', memberIds: ['a', 'b'] }];

  it('counts the class, a group or picked students', () => {
    expect(audienceSize({ type: 'class' }, 24, groups)).toBe(24);
    expect(audienceSize({ type: 'group', groupId: 'g' }, 24, groups)).toBe(2);
    expect(audienceSize({ type: 'students', ids: ['a'] }, 24, groups)).toBe(1);
  });
});

describe('filterMembers', () => {
  const member = (id: string, name: string): ClassMember => ({
    id,
    name,
    sharesProgress: true,
    mutedInChat: false,
  });
  const members = [member('a', 'Nərmin Əliyeva'), member('b', 'Orxan M.'), member('c', 'Nigar M.')];

  it('filters by name and by group', () => {
    const byName = filterMembers(members, (n) => matchesName(n, 'n'), null);
    expect(byName.map((m) => m.id)).toEqual(['a', 'b', 'c']);
    const group = { id: 'g', name: 'Qrup', memberIds: ['b'] };
    expect(filterMembers(members, () => true, group).map((m) => m.id)).toEqual(['b']);
  });
});

describe('stepValue', () => {
  it('stays within the limits', () => {
    expect(stepValue(2, 1, 1, 5)).toBe(3);
    expect(stepValue(5, 1, 1, 5)).toBe(5);
    expect(stepValue(1, -1, 1, 5)).toBe(1);
  });
});
