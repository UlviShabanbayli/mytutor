// The daily goal in minutes and the week of flight days (architecture P2).

/** The design's default when the student has not picked 10, 20 or 30 minutes. */
export const DEFAULT_GOAL_MINUTES = 20;

/** A break this long (days since the last visit) opens the "we missed you" sheet. */
export const COMEBACK_AFTER_DAYS = 7;

export type GoalProgress = {
  done: number;
  goal: number;
  left: number;
  complete: boolean;
  /** 0–1, for the ring. */
  fraction: number;
};

export function goalProgress(minutes: number, goal: number): GoalProgress {
  const safeGoal = Math.max(1, goal);
  const done = Math.max(0, Math.round(minutes));
  return {
    done,
    goal: safeGoal,
    left: Math.max(0, safeGoal - done),
    complete: done >= safeGoal,
    fraction: Math.min(1, done / safeGoal),
  };
}

/**
 * One day of the week row: a filled cell for a flight day, today's cell with a honey rim
 * (nectar inside once started), an empty wax cell otherwise.
 */
export type DayCell = 'done' | 'todayStarted' | 'today' | 'empty';

/** Monday-first cells from the days with activity, today's index and today's progress. */
export function weekCells(active: boolean[], todayIdx: number, progress: GoalProgress): DayCell[] {
  return active.map((on, i) => {
    if (i !== todayIdx) return on ? 'done' : 'empty';
    if (progress.complete) return 'done';
    return on || progress.done > 0 ? 'todayStarted' : 'today';
  });
}

/** Which flight day today becomes: the running streak counts today once it has activity. */
export function flightDayNumber(streak: number, activeToday: boolean): number {
  return activeToday ? Math.max(1, streak) : streak + 1;
}
