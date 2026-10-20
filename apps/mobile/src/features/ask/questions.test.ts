import { buildDemoWorld, selectAskQuestions } from '@mytutor/demo-data';
import { toAskQuestion } from './fromWorld';
import {
  chatLeft,
  filterCounts,
  groupByDay,
  matchesFilter,
  photosLeft,
  sortNewest,
  timelineSteps,
} from './questions';
import type { AskQuestion } from './types';

const t = ((key: string) => key) as never;
const world = buildDemoWorld({ now: new Date('2026-10-18T11:00:00.000Z'), persona: 'nermin' });
const questions = selectAskQuestions(world).map((q) => toAskQuestion(t, q));

const at = (q: AskQuestion, date: Date): AskQuestion => ({ ...q, sentAt: date.toISOString() });

describe('filters', () => {
  it('splits waiting and ready questions', () => {
    const counts = filterCounts(questions);
    expect(counts.all).toBe(questions.length);
    expect(counts.waiting + counts.ready).toBe(counts.all);
    expect(questions.filter((q) => matchesFilter(q, 'waiting')).map((q) => q.status)).toEqual([
      'teacher_checking',
    ]);
  });
});

describe('groupByDay', () => {
  it('groups by local day, newest day and question first', () => {
    const [a, b, c] = questions as [AskQuestion, AskQuestion, AskQuestion];
    const groups = groupByDay([
      at(a, new Date(2026, 9, 16, 9)),
      at(b, new Date(2026, 9, 18, 9)),
      at(c, new Date(2026, 9, 18, 14)),
    ]);
    expect(groups.map((g) => g.items.length)).toEqual([2, 1]);
    expect(groups[0]?.items[0]?.id).toBe(c.id);
  });

  it('sorts newest first without changing the input', () => {
    const reversed = [...questions].reverse();
    expect(sortNewest(reversed).map((q) => q.id)).toEqual(questions.map((q) => q.id));
    expect(reversed[0]?.id).toBe(questions[questions.length - 1]?.id);
  });
});

describe('timelineSteps', () => {
  it('puts the current step where the question is', () => {
    const states = (status: AskQuestion['status']) => timelineSteps({ status }).map((s) => s.state);
    expect(states('queued')).toEqual(['current', 'todo', 'todo', 'todo']);
    expect(states('sent')).toEqual(['done', 'current', 'todo', 'todo']);
    expect(states('teacher_checking')).toEqual(['done', 'done', 'current', 'todo']);
    expect(states('answered')).toEqual(['done', 'done', 'done', 'done']);
  });
});

describe('limits', () => {
  it('never goes below zero', () => {
    const usage = { photoUsed: 4, photoLimit: 3, chatUsed: 2, chatLimit: 6 };
    expect(photosLeft(usage)).toBe(0);
    expect(chatLeft(usage)).toBe(4);
  });
});

describe("the world's questions", () => {
  it('mark AI text until a teacher approves, and cite a source', () => {
    for (const q of questions) {
      expect(q.source).not.toBeNull();
      if (q.status === 'answered') expect(q.answer).not.toBeNull();
      else expect(q.answer).toBeNull();
    }
    expect(questions.some((q) => q.aiDraft !== null && q.status === 'teacher_checking')).toBe(true);
  });
});
