import i18n from '@/i18n';
import {
  daysBetween,
  formatClock,
  formatDayLabel,
  formatDayMonthTime,
  formatDuration,
  formatWeekRange,
  formatWhen,
} from './format';

const t = i18n.t.bind(i18n);
const now = new Date(2026, 9, 18, 18, 0);

beforeAll(() => i18n.changeLanguage('az'));

describe('dates', () => {
  it('counts calendar days, not 24-hour spans', () => {
    expect(daysBetween(new Date(2026, 9, 17, 23, 59), new Date(2026, 9, 18, 0, 1))).toBe(1);
    expect(daysBetween(new Date(2026, 9, 18, 0, 1), now)).toBe(0);
  });

  it('names today and yesterday, and dates otherwise', () => {
    expect(formatDayLabel(t, new Date(2026, 9, 18, 10, 12), now)).toBe('Bu gün');
    expect(formatDayLabel(t, new Date(2026, 9, 17, 18, 20), now)).toBe('Dünən');
    expect(formatDayLabel(t, new Date(2026, 9, 14), now)).toBe('14 oktyabr');
    expect(formatWhen(t, new Date(2026, 9, 18, 17, 52), now)).toBe('bu gün, 17:52');
    expect(formatClock(t, new Date(2026, 9, 18, 17, 40), now)).toBe('17:40');
    expect(formatDayMonthTime(t, new Date(2026, 9, 21, 23, 59))).toBe('21 okt, 23:59');
  });

  it('writes week ranges inside and across months', () => {
    expect(formatWeekRange(t, new Date(2026, 9, 12))).toBe('12–18 oktyabr');
    expect(formatWeekRange(t, new Date(2026, 9, 12), true)).toBe('12–18 okt');
    expect(formatWeekRange(t, new Date(2026, 8, 28))).toBe('28 sentyabr – 4 oktyabr');
  });
});

describe('formatDuration', () => {
  it('writes hours and minutes in both styles', () => {
    expect(formatDuration(t, 130)).toBe('2 saat 10 dəq');
    expect(formatDuration(t, 105, 'short')).toBe('1 s 45 dəq');
    expect(formatDuration(t, 45)).toBe('45 dəq');
    expect(formatDuration(t, 120)).toBe('2 saat');
  });
});
