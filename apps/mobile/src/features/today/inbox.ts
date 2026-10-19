import type { Href } from 'expo-router';
import { dayKey, relativeDay, type DayRelation } from './dates';
import type { InboxItem } from './types';

export type InboxGroup = {
  /** Day key, stable for list keys. */
  key: string;
  relation: DayRelation;
  /** A moment of that day, for the date heading of older days. */
  date: Date;
  items: InboxItem[];
};

/** Newest first, grouped by local day. */
export function groupInbox(items: InboxItem[], now: Date): InboxGroup[] {
  const sorted = [...items].sort((a, b) => b.at.localeCompare(a.at));
  const groups: InboxGroup[] = [];
  for (const item of sorted) {
    const date = new Date(item.at);
    const key = dayKey(date);
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push(item);
    else groups.push({ key, relation: relativeDay(date, now), date, items: [item] });
  }
  return groups;
}

export const isUnread = (item: InboxItem, readIds: readonly string[]) =>
  !item.read && !readIds.includes(item.id);

export function unreadCount(items: InboxItem[], readIds: readonly string[]): number {
  return items.filter((item) => isUnread(item, readIds)).length;
}

/** Each notification opens the exact screen it is about (deep link, architecture P1). */
export function inboxHref(item: InboxItem): Href {
  switch (item.kind) {
    case 'answerReady':
      return { pathname: '/ask/[id]', params: { id: item.questionId } };
    case 'newAssignment':
      return { pathname: '/assignment/[id]', params: { id: item.assignmentId } };
    case 'reviewDue':
      return '/review';
    case 'streak':
    case 'weeklySummary':
      return '/me/progress';
  }
}
