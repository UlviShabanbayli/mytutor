import { answerDemo } from '@mytutor/demo-data';
import { meProgressSchema } from '@mytutor/schemas';
import { bakuWeekday, chartMax, goalDays } from './weekStats';

const NOW = new Date('2026-10-20T06:00:00.000Z');

describe('week stats', () => {
  it('counts goal days and scales the chart above the goal', () => {
    expect(goalDays([10, 0, 0, 11, 0, 0, 0], 10)).toBe(2);
    expect(chartMax([10, 0, 0, 11, 0, 0, 0], 10)).toBe(15);
    expect(chartMax([30, 0, 0, 0, 0, 0, 0], 10)).toBe(30);
  });

  it('names the world’s days by their Baku weekday', () => {
    // Tuesday 20 October 2026 starts at 20:00 UTC the day before.
    expect(bakuWeekday('2026-10-19T20:00:00.000Z')).toBe(1);
    expect(bakuWeekday('2026-10-19T19:59:00.000Z')).toBe(0);
  });

  it('reads the last seven days from the world, today last', () => {
    const answer = answerDemo('/v1/me/progress', { persona: 'nermin', now: NOW });
    const week = meProgressSchema.parse(answer.body).week;
    expect(week?.days.map((d) => bakuWeekday(d.date))).toEqual([2, 3, 4, 5, 6, 0, 1]);
    expect(week?.days.reduce((n, d) => n + d.answered, 0)).toBe(64);
  });
});
