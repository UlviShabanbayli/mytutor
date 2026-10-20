import { clockOf, dayOf, whenOf } from './when';

// Tuesday 20 October 2026, 10:00 in Baku (06:00 UTC).
const now = new Date('2026-10-20T06:00:00.000Z');

describe('when (Baku time)', () => {
  it('names today, yesterday and tomorrow with the Baku clock time', () => {
    expect(whenOf('2026-10-20T14:00:00.000Z', now)).toEqual({ day: 'today', time: '18:00' });
    expect(whenOf('2026-10-19T17:20:00.000Z', now)).toEqual({ day: 'yesterday', time: '21:20' });
    expect(whenOf('2026-10-21T14:00:00.000Z', now, false)).toEqual({ day: 'tomorrow' });
  });

  it('names other days by weekday, Monday = 0', () => {
    // Saturday 24 October, 20:00 in Baku.
    expect(whenOf('2026-10-24T16:00:00.000Z', now)).toEqual({ day: 5, time: '20:00' });
    // Last Thursday.
    expect(whenOf('2026-10-15T08:00:00.000Z', now, false)).toEqual({ day: 3 });
  });

  it('dates a day more than a week away', () => {
    // Saturday 10 October.
    expect(whenOf('2026-10-10T19:59:00.000Z', now)).toEqual({
      day: 5,
      date: '2026-10-10',
      time: '23:59',
    });
  });

  it('turns a UTC moment late in the evening into the next Baku day', () => {
    expect(dayOf('2026-10-19T21:30:00.000Z')).toBe('2026-10-20');
    expect(clockOf('2026-10-19T21:30:00.000Z')).toBe('01:30');
  });
});
