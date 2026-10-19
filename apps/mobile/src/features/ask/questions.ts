import { dayKey } from './dates';
import type { AskQuestion, AskUsage } from './types';

export type QuestionFilter = 'all' | 'waiting' | 'ready';

export const QUESTION_FILTERS: readonly QuestionFilter[] = ['all', 'waiting', 'ready'];

export function matchesFilter(question: AskQuestion, filter: QuestionFilter): boolean {
  if (filter === 'all') return true;
  return filter === 'ready' ? question.status === 'answered' : question.status !== 'answered';
}

export function filterCounts(questions: AskQuestion[]): Record<QuestionFilter, number> {
  return {
    all: questions.length,
    waiting: questions.filter((q) => matchesFilter(q, 'waiting')).length,
    ready: questions.filter((q) => matchesFilter(q, 'ready')).length,
  };
}

/** Newest first. */
export function sortNewest(questions: AskQuestion[]): AskQuestion[] {
  return [...questions].sort((a, b) => Date.parse(b.sentAt) - Date.parse(a.sentAt));
}

export type DayGroup = { key: string; date: Date; items: AskQuestion[] };

/** Groups questions (any order) by local day of sending, newest day and question first. */
export function groupByDay(questions: AskQuestion[]): DayGroup[] {
  const groups: DayGroup[] = [];
  for (const question of sortNewest(questions)) {
    const date = new Date(question.sentAt);
    const key = dayKey(date);
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push(question);
    else groups.push({ key, date, items: [question] });
  }
  return groups;
}

/** Photo questions left today on the free plan (never below zero). */
export function photosLeft(usage: AskUsage): number {
  return Math.max(0, usage.photoLimit - usage.photoUsed);
}

/** Vızı messages left today on the free plan (never below zero). */
export function chatLeft(usage: AskUsage): number {
  return Math.max(0, usage.chatLimit - usage.chatUsed);
}

/** Which step of the four the question is on (status screen timeline). */
export type StepState = 'done' | 'current' | 'todo';

export type TimelineStepKey = 'sent' | 'ai' | 'teacher' | 'ready';

export type TimelineStep = { key: TimelineStepKey; state: StepState };

const ORDER: TimelineStepKey[] = ['sent', 'ai', 'teacher', 'ready'];

/** Sent → AI solved → teacher checking → ready; the current step is the one in progress. */
export function timelineSteps(question: Pick<AskQuestion, 'status'>): TimelineStep[] {
  const current: Record<AskQuestion['status'], number> = {
    queued: 0,
    sent: 1,
    teacher_checking: 2,
    answered: 4,
  };
  const at = current[question.status];
  return ORDER.map((key, i) => ({
    key,
    state: i < at ? 'done' : i === at ? 'current' : 'todo',
  }));
}
