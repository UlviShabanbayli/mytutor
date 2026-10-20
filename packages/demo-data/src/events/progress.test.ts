import { describe, expect, it } from 'vitest';
import type { DemoEvent, MeProgress, ReportPage } from '@mytutor/types';
import { NOW, ev, get } from './testEvents';

/** A finished test reaches the week chart, the recent results and the parent's report. */

const finished = (studentId: string, at: string): DemoEvent =>
  ({
    ...ev({
      type: 'test.finished',
      studentId,
      testId: 'test-riyaziyyat-7-4-3',
      title: 'Cəmin və fərqin kubu',
      kind: 'practice',
      ref: '4.3',
      answered: 3,
      correct: 2,
      total: 3,
    }),
    at,
  }) as DemoEvent;

const today = new Date(NOW.getTime() - 5 * 60_000).toISOString();

describe('test.finished', () => {
  it('adds to today and to the recent results', () => {
    const before = get('/v1/me/progress', []) as unknown as MeProgress;
    const after = get('/v1/me/progress', [finished('nermin', today)]) as unknown as MeProgress;
    const [d0, d1] = [before.week?.days[6], after.week?.days[6]];
    expect([d1?.answered, d1?.correct, d1?.minutes]).toEqual([
      (d0?.answered ?? 0) + 3,
      (d0?.correct ?? 0) + 2,
      (d0?.minutes ?? 0) + 3,
    ]);
    expect(after.week?.answers.total).toBe((before.week?.answers.total ?? 0) + 3);
    expect(after.recentTests[0]).toMatchObject({ title: 'Cəmin və fərqin kubu', correct: 2 });
    const report = get('/v1/parent/children/nermin/report?week=0', [finished('nermin', today)]);
    expect((report as unknown as ReportPage).report?.answers.total).toBe(after.week?.answers.total);
  });

  it('gives a first-day student a week of their own', () => {
    const before = get('/v1/me/progress', [], 'fresh') as unknown as MeProgress;
    expect(before).toEqual({ week: null, recentTests: [] });
    const after = get('/v1/me/progress', [finished('yeni-sagird', today)], 'fresh');
    const week = (after as unknown as MeProgress).week;
    expect(week?.days.map((d) => d.answered)).toEqual([0, 0, 0, 0, 0, 0, 3]);
    expect(week?.activeDays.filter(Boolean)).toHaveLength(1);
  });

  it('counts a test of an earlier day on that day, and ignores one older than a week', () => {
    const yesterday = new Date(NOW.getTime() - 24 * 3_600_000).toISOString();
    const progress = get('/v1/me/progress', [
      finished('nermin', yesterday),
    ]) as unknown as MeProgress;
    const base = get('/v1/me/progress', []) as unknown as MeProgress;
    expect(progress.week?.days[5]?.answered).toBe((base.week?.days[5]?.answered ?? 0) + 3);
    const old = new Date(NOW.getTime() - 9 * 24 * 3_600_000).toISOString();
    const older = get('/v1/me/progress', [finished('nermin', old)]) as unknown as MeProgress;
    expect(older.week).toEqual(base.week);
    expect(older.recentTests).toHaveLength(base.recentTests.length + 1);
  });
});
