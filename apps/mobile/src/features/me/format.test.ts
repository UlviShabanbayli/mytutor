import i18n from '@/i18n';
import { formatDay, formatNumber, formatWhen } from './format';

describe('formatNumber', () => {
  it('groups thousands with a no-break space', () => {
    expect(formatNumber(2140)).toBe('2 140');
    expect(formatNumber(860)).toBe('860');
    expect(formatNumber(15000)).toBe('15 000');
  });
});

describe('formatWhen / formatDay', () => {
  const t = i18n.getFixedT('az');

  it('names weekdays and relative days with a time', () => {
    expect(formatWhen(t, { day: 4, time: '20:00' })).toBe('Cümə 20:00');
    expect(formatWhen(t, { day: 'tomorrow', time: '23:59' })).toBe('Sabah 23:59');
    expect(formatWhen(t, { day: 2 })).toBe('Çərşənbə');
  });

  it('writes a date with the month name', () => {
    expect(formatDay(t, '2026-09-03')).toBe('3 sentyabr');
    expect(formatDay(t, '2026-10-15', true)).toBe('15 OKT');
  });
});
