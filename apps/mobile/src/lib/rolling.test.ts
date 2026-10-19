import { groupThousands, rollDuration, rollingSlots } from './rolling';

describe('groupThousands', () => {
  it('groups with a no-break space', () => {
    expect(groupThousands(2140)).toBe('2 140');
    expect(groupThousands(1234567)).toBe('1 234 567');
    expect(groupThousands(999)).toBe('999');
  });
});

describe('rollingSlots', () => {
  it('keys digits from the right so the ones keep their strip', () => {
    const before = rollingSlots('99').map((s) => s.key);
    const after = rollingSlots('100').map((s) => s.key);
    expect(before).toEqual(['d1', 'd0']);
    expect(after).toEqual(['d2', 'd1', 'd0']);
  });

  it('leaves signs and spaces still and orders digits left to right', () => {
    const slots = rollingSlots('+2 140');
    expect(slots.map((s) => s.digit)).toEqual([null, 2, null, 1, 4, 0]);
    expect(slots.filter((s) => s.digit !== null).map((s) => s.order)).toEqual([0, 1, 2, 3]);
  });
});

describe('rollDuration', () => {
  it('waits for the last staggered digit to settle', () => {
    expect(rollDuration(3, 70, 700)).toBe(840);
    expect(rollDuration(1, 70, 700)).toBe(700);
    expect(rollDuration(0, 70, 700)).toBe(700);
  });
});
