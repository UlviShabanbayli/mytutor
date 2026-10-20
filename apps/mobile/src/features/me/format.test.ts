import i18n from '@/i18n';
import { formatDay, formatNumber, formatPhone, formatWhen } from './format';

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
    expect(formatWhen(t, { day: 5, date: '2026-10-10', time: '23:59' })).toBe('10 oktyabr 23:59');
  });

  it('writes a date with the month name', () => {
    expect(formatDay(t, '2026-09-03')).toBe('3 sentyabr');
    expect(formatDay(t, '2026-10-15', true)).toBe('15 OKT');
  });
});

describe('formatPhone', () => {
  it('groups an Azerbaijani number as it is read aloud', () => {
    expect(formatPhone('+994500000001')).toBe('+994 50 000 00 01');
  });
});
