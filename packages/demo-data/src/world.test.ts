import { describe, expect, it, vi } from 'vitest';
import { demoWorldSchema, phoneNumberSchema } from '@mytutor/schemas';
import { DEMO_ACCOUNTS, DEMO_SMS_CODE, buildDemoWorld } from '.';
import { TEXTBOOKS } from './curriculum';
import { countLevels, filledCount } from './mastery';

// 2026-10-20 10:00 in Baku (UTC+4), a Tuesday.
const NOW = new Date('2026-10-20T06:00:00.000Z');
const DAY = 24 * 3_600_000;
const nermin = () => buildDemoWorld({ now: NOW, persona: 'nermin' });
const fresh = () => buildDemoWorld({ now: NOW, persona: 'fresh' });

describe('buildDemoWorld', () => {
  it.each([
    ['a weekday morning', NOW],
    ['just after midnight in Baku', new Date('2026-10-19T20:05:00.000Z')],
    ['a Sunday evening', new Date('2026-10-25T17:00:00.000Z')],
    ['a Monday at dawn', new Date('2027-03-01T01:00:00.000Z')],
  ])('parses with the world schema on %s, for both personas', (_, now) => {
    for (const persona of ['nermin', 'fresh'] as const)
      expect(() => demoWorldSchema.parse(buildDemoWorld({ now, persona }))).not.toThrow();
  });

  it('is deterministic: no randomness and no clock reading', () => {
    const random = vi.spyOn(Math, 'random').mockImplementation(() => {
      throw new Error('Math.random');
    });
    const clock = vi.spyOn(Date, 'now').mockImplementation(() => {
      throw new Error('Date.now');
    });
    try {
      expect(JSON.stringify(nermin())).toBe(JSON.stringify(nermin()));
    } finally {
      random.mockRestore();
      clock.mockRestore();
    }
  });

  it('dates every moment relative to now', () => {
    const later = buildDemoWorld({ now: new Date(NOW.getTime() + DAY), persona: 'nermin' });
    const shift = (iso: string) => new Date(Date.parse(iso) + DAY).toISOString();
    const world = nermin();
    expect(later.liveLessons[0]?.startsAt).toBe(shift(world.liveLessons[0]?.startsAt ?? ''));
    expect(later.assignments.map((a) => a.dueAt)).toEqual(
      world.assignments.map((a) => a.dueAt).map(shift),
    );
  });

  it('follows the one id scheme', () => {
    const world = nermin();
    const topicIds = TEXTBOOKS.flatMap((b) =>
      b.volumes.flatMap((v) => v.units.flatMap((u) => u.topics)),
    );
    for (const t of topicIds) expect(t.id).toMatch(/^riyaziyyat-[78]-\d+-\d+$/);
    expect(world.lessons.map((l) => l.id)).toContain('riyaziyyat-7-4-3');
    expect(world.tests.map((t) => t.test.id)).toEqual([
      'test-riyaziyyat-7-2-2',
      'test-riyaziyyat-7-3-1',
      'test-riyaziyyat-7-4-1',
      'test-riyaziyyat-7-4-2',
      'test-riyaziyyat-7-4-3',
      'test-riyaziyyat-7-4-4',
      'test-riyaziyyat-7-4-5',
      'test-riyaziyyat-7-u4',
      'test-review',
    ]);
    const json = JSON.stringify(world);
    for (const old of ['"r7-', 'demo-4.3', '"4.3"-', 'R4T9KB', 'q-cube', 'Murad_11', '481926'])
      expect(json).not.toContain(old);
  });

  it('has the real table of contents: 26, 22 and 62 topics; only R7 part 1 is ready', () => {
    const count = (id: string, part: number) =>
      TEXTBOOKS.find((b) => b.id === id)
        ?.volumes.find((v) => v.part === part)
        ?.units.reduce((n, u) => n + u.topics.length, 0);
    expect([count('trims-7', 1), count('trims-7', 2), count('radius-8', 1)]).toEqual([26, 22, 62]);
    const ready = TEXTBOOKS.flatMap((b) => b.volumes.filter((v) => v.ready).map(() => b.id));
    expect(ready).toEqual(['trims-7']);
    const topic = (n: string) =>
      TEXTBOOKS[0]?.volumes[0]?.units.flatMap((u) => u.topics).find((t) => t.number === n);
    expect(topic('4.1')?.pages).toEqual({ start: 83, end: 86 });
    expect(topic('4.3')?.title).toBe('Cəmin və fərqin kubu. Kublar cəmi və kublar fərqi');
    expect(topic('4.3')?.shortTitle).toBe('Cəmin və fərqin kubu');
  });

  it('has one mastery map: 17 of 26 filled, 4.3 current', () => {
    const map = nermin().mastery.nermin ?? {};
    expect(countLevels(map)).toEqual({
      reinforced: 8,
      mastered: 7,
      lesson_completed: 1,
      needs_practice: 2,
      not_started: 8,
    });
    expect(filledCount(map)).toBe(17);
    expect(map['riyaziyyat-7-4-3']).toBe('lesson_completed');
    expect([map['riyaziyyat-7-2-2'], map['riyaziyyat-7-3-1']]).toEqual([
      'needs_practice',
      'needs_practice',
    ]);
  });

  it('has one set of numbers', () => {
    const world = nermin();
    expect(world.student.points).toEqual({ total: 2140, week: 340, today: 45 });
    expect(world.student.streak).toBe(12);
    const week = world.weekReports.nermin?.[0];
    expect(week?.minutes).toBe(130);
    expect(week?.answers).toEqual({ correct: 52, total: 64 });
    expect(week?.newTopics).toHaveLength(4);
    expect(world.members.find((m) => m.personId === 'nermin')?.weekPoints).toBe(340);
    expect(world.countryLeague.find((r) => r.nickname === world.student.nickname)?.points).toBe(
      340,
    );
  });

  it('keeps one state per shared thing', () => {
    const world = nermin();
    const hw = world.submissions.find((s) => s.id === 'sub-hw-4-1-nermin');
    expect(hw?.state).toBe('submitted');
    expect(hw?.grade).toBeNull();
    expect(hw?.ai?.suggested).toEqual({ score: 8, max: 10 });
    expect(Date.parse(NOW.toISOString()) - Date.parse(hw?.submittedAt ?? '')).toBeLessThan(2 * DAY);
    const quiz = world.assignments.find((a) => a.id === 'quiz-4-2');
    expect(quiz?.audience).toEqual({ type: 'class' });
    expect(quiz?.classId).toBe('7b');
    const live = world.liveLessons[0];
    expect([live?.title, live?.recorded, live?.startsAt]).toEqual([
      '4.2 təkrarı',
      true,
      '2026-10-21T14:00:00.000Z',
    ]);
    const q = world.askQuestions.find((x) => x.id === 'q-nermin-1');
    expect([q?.mark, q?.status, q?.aiDraft?.status, q?.answer]).toEqual([
      '(2x+3)³',
      'teacher_checking',
      'ready',
      null,
    ]);
    expect(world.classes.find((c) => c.id === '7b')?.joinCode).toBe('7B-MATH-4K2');
    expect(world.codes.some((c) => c.kind === 'parent' && c.code === 'K7Q42M')).toBe(true);
    expect([world.smsCode, DEMO_SMS_CODE]).toEqual(['246810', '246810']);
  });

  it('has a 24-student 7B with full names and short forms derived from them', () => {
    const world = nermin();
    const roster = world.members.filter((m) => m.classId === '7b');
    expect(roster).toHaveLength(24);
    const people = roster.map((m) => world.people.find((p) => p.id === m.personId));
    for (const p of people) expect(p?.lastName).toBeTruthy();
    expect(people.find((p) => p?.id === 'aysel')?.shortName).toBe('Aysel Q.');
    expect(world.members.filter((m) => m.classId === '7a')).toHaveLength(22);
  });

  it('says "demo" in every source line', () => {
    const json = JSON.stringify(nermin());
    const sources = [...json.matchAll(/"source":"([^"]*)"/g)].map((m) => m[1] ?? '');
    expect(sources.length).toBeGreaterThan(20);
    for (const s of sources) expect(s).toContain('demo');
    for (const t of nermin().tests)
      for (const q of t.test.questions) expect(q.source.demo).toBe(true);
  });

  it('gives the first-day student an empty world', () => {
    const world = fresh();
    expect(world.student.classIds).toEqual([]);
    expect(world.student.points).toEqual({ total: 0, week: 0, today: 0 });
    expect(world.mastery[world.student.personId]).toEqual({});
    expect(world.activity.unfinishedLesson).toBeNull();
    expect(world.mistakes).toEqual([]);
    expect(world.mockRuns).toEqual([]);
  });

  it('lists one fake phone per role and persona, valid for the app', () => {
    expect(DEMO_ACCOUNTS.map((a) => `${a.role}:${a.persona}`)).toEqual([
      'student:nermin',
      'student:fresh',
      'teacher:nermin',
      'parent:nermin',
    ]);
    for (const a of DEMO_ACCOUNTS) expect(phoneNumberSchema.parse(a.phone)).toBe(a.phone);
  });
});
