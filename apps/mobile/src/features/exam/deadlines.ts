import { daysBetween } from './calendar';
import type { Deadline } from './types';

export type DeadlineGroupKey =
  { kind: 'thisWeek' } | { kind: 'month'; month: number; year: number } | { kind: 'official' };

export type DeadlineGroup = { id: string; key: DeadlineGroupKey; items: Deadline[] };

/**
 * One calendar: the next seven days first, then later dates by month, then the official DİM
 * dates that are not announced yet. Past dates are left out.
 */
export function groupDeadlines(items: Deadline[], today: Date): DeadlineGroup[] {
  const groups: DeadlineGroup[] = [];
  const add = (id: string, key: DeadlineGroupKey, item: Deadline) => {
    const group = groups.find((g) => g.id === id);
    if (group) group.items.push(item);
    else groups.push({ id, key, items: [item] });
  };

  const dated = items
    .filter((d): d is Extract<Deadline, { date: Date }> => d.date !== null)
    .filter((d) => daysBetween(today, d.date) >= 0)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
  for (const item of dated) {
    if (daysBetween(today, item.date) < 7) add('week', { kind: 'thisWeek' }, item);
    else {
      const month = item.date.getMonth();
      const year = item.date.getFullYear();
      add(`${year}-${month}`, { kind: 'month', month, year }, item);
    }
  }
  for (const item of items) if (item.date === null) add('official', { kind: 'official' }, item);
  return groups;
}
