import i18n from '@/i18n';
import { dayHeading, daysAgo, formatClock, relativeDay, shortWhen } from './dates';
import { initials } from './labels';

const t = i18n.t;
const now = new Date(2026, 9, 18, 15, 0);

describe('dates', () => {
  it('counts calendar days, not 24-hour spans', () => {
    expect(daysAgo(new Date(2026, 9, 18, 0, 5), now)).toBe(0);
    expect(daysAgo(new Date(2026, 9, 17, 23, 55), now)).toBe(1);
  });

  it('shows the time today, "Dünən", then the date', () => {
    expect(formatClock(new Date(2026, 9, 18, 9, 5))).toBe('09:05');
    expect(relativeDay(t, new Date(2026, 9, 18, 14, 2), now)).toBe('14:02');
    expect(relativeDay(t, new Date(2026, 9, 17, 14, 2), now)).toBe('Dünən');
    expect(relativeDay(t, new Date(2026, 9, 15, 14, 2), now)).toBe('15 oktyabr');
    expect(shortWhen(t, new Date(2026, 9, 15, 14, 2), now)).toBe('15 oktyabr, 14:02');
  });

  it('writes Azerbaijani CAPS day headings with the dotted İ', () => {
    expect(dayHeading(t, new Date(2026, 9, 18), now, 'az')).toBe('BU GÜN');
    expect(dayHeading(t, new Date(2026, 5, 3), now, 'az')).toBe('3 İYUN');
  });
});

describe('initials', () => {
  it('takes the first letters of two words', () => {
    expect(initials('Lalə Həsənova')).toBe('LH');
    expect(initials('  İlkin  ')).toBe('İ');
  });
});
