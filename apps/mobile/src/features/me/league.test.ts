import { leagueSections, leagueZone } from './league';
import type { LeagueRow } from './types';

const RULES = { size: 20, promote: 5, demote: 5 };
const rows: LeagueRow[] = Array.from({ length: 20 }, (_, i) => ({
  place: i + 1,
  nickname: `Arı_${i + 1}`,
  points: 2000 - i * 50,
}));

describe('leagueZone', () => {
  it('moves the first five up and the last five down', () => {
    expect(leagueZone(1, RULES)).toBe('promotion');
    expect(leagueZone(5, RULES)).toBe('promotion');
    expect(leagueZone(6, RULES)).toBe('stay');
    expect(leagueZone(15, RULES)).toBe('stay');
    expect(leagueZone(16, RULES)).toBe('demotion');
    expect(leagueZone(20, RULES)).toBe('demotion');
  });
});

describe('leagueSections', () => {
  it('shows the middle up to the row after the student and hides the rest', () => {
    const s = leagueSections(rows, RULES, 6);
    expect(s.promotion.map((r) => r.place)).toEqual([1, 2, 3, 4, 5]);
    expect(s.middle.map((r) => r.place)).toEqual([6, 7]);
    expect(s.hidden.map((r) => r.place)).toEqual([8, 9, 10, 11, 12, 13, 14, 15]);
    expect(s.demotion.map((r) => r.place)).toEqual([16, 17, 18, 19, 20]);
  });

  it('keeps a student deep in the middle visible', () => {
    const s = leagueSections(rows, RULES, 12);
    expect(s.middle.map((r) => r.place)).toEqual([6, 7, 8, 9, 10, 11, 12, 13]);
    expect(s.hidden.map((r) => r.place)).toEqual([14, 15]);
  });
});
