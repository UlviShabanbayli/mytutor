import type { Assignment, Mastery, UnitProgress, WeekReport } from './types';

/** Honey and sealed cells count as mastered ("hüceyrə mənimsənilib"). */
export const isMastered = (level: Mastery) => level === 'mastered' || level === 'reinforced';

export type UnitNote =
  | { kind: 'practice'; count: number }
  | { kind: 'learning'; count: number }
  | { kind: 'all' }
  | { kind: 'remaining'; count: number }
  | { kind: 'notStarted' };

export type UnitStats = {
  done: number;
  total: number;
  /** The level the unit's number hexagon shows: honey when complete, nectar while in progress. */
  level: Mastery;
  note: UnitNote;
};

/** One frame (çərçivə) of the hive box summed up, as the subject screen shows it. */
export function unitStats(unit: UnitProgress): UnitStats {
  const levels = unit.topics.map((t) => t.level);
  const total = levels.length;
  const done = levels.filter(isMastered).length;
  const practice = levels.filter((l) => l === 'needs_practice').length;
  const learning = levels.filter((l) => l === 'lesson_completed').length;
  const started = levels.some((l) => l !== 'not_started');
  const level: Mastery =
    total > 0 && done === total ? 'mastered' : started ? 'lesson_completed' : 'not_started';
  const note: UnitNote =
    practice > 0
      ? { kind: 'practice', count: practice }
      : learning > 0
        ? { kind: 'learning', count: learning }
        : total > 0 && done === total
          ? { kind: 'all' }
          : started
            ? { kind: 'remaining', count: total - done }
            : { kind: 'notStarted' };
  return { done, total, level, note };
}

export function subjectTotals(units: UnitProgress[]) {
  const levels = units.flatMap((u) => u.topics.map((t) => t.level));
  return { done: levels.filter(isMastered).length, total: levels.length };
}

export type SummaryClause =
  | { kind: 'days'; count: number }
  | { kind: 'topics'; count: number }
  | { kind: 'tasksAll'; count: number }
  | { kind: 'tasksSome'; onTime: number; total: number };

/**
 * The calm one-sentence summary of a week, as facts in order: days, new topics, assignments.
 * Empty when the child did not study that week (the screen says so plainly).
 */
export function summaryClauses(report: WeekReport): SummaryClause[] {
  const days = report.activeDays.filter(Boolean).length;
  if (days === 0) return [];
  const clauses: SummaryClause[] = [{ kind: 'days', count: days }];
  if (report.newTopics.length > 0) clauses.push({ kind: 'topics', count: report.newTopics.length });
  const tasks = report.assignments;
  if (tasks && tasks.total > 0) {
    clauses.push(
      tasks.onTime === tasks.total
        ? { kind: 'tasksAll', count: tasks.total }
        : { kind: 'tasksSome', onTime: tasks.onTime, total: tasks.total },
    );
  }
  return clauses;
}

export type AssignmentFilter = 'all' | 'active' | 'done';

export const isAssignmentDone = (a: Assignment) => a.state === 'submitted' || a.state === 'checked';

/** Open work and finished work, each in the order the server sends (newest first). */
export function groupAssignments(items: Assignment[]) {
  return {
    active: items.filter((a) => !isAssignmentDone(a)),
    done: items.filter(isAssignmentDone),
  };
}

export type AssignmentTone = 'work' | 'late' | 'ok' | 'check' | 'idle';

/** The status pill of an assignment: colour tone and icon (the label is never colour alone). */
export function assignmentTone(a: Assignment): AssignmentTone {
  switch (a.state) {
    case 'in_progress':
      return 'work';
    case 'late':
      return 'late';
    case 'checked':
      return 'ok';
    case 'submitted':
      return 'check';
    default:
      return 'idle';
  }
}
