import type { Href } from 'expo-router';
import type { AppNotification, ClassSummary, StudentAssignment } from '@mytutor/types';
import { dayKey, relativeDay, type DayRelation } from './dates';
import type { InboxItem } from './types';

/**
 * The student's notifications as inbox rows, with the assignment's title and class and the
 * teacher's name filled in. A notice about an assignment the student no longer has is left out.
 */
export function inboxItems(
  notifications: AppNotification[],
  assignments: StudentAssignment[],
  classes: ClassSummary[],
): InboxItem[] {
  const teacherName = (id: string) =>
    classes.find((c) => c.teacher.id === id)?.teacher.name ?? null;
  const assignment = (id: string) => assignments.find((a) => a.id === id);
  const className = (classId: string) =>
    classes.find((c) => c.id === classId)?.shortName ?? classId;
  return notifications.flatMap((n): InboxItem[] => {
    const base = { id: n.id, at: n.at, read: n.read };
    switch (n.kind) {
      case 'answerReady':
        return [
          { ...base, kind: n.kind, questionId: n.questionId, teacher: teacherName(n.teacherId) },
        ];
      case 'newAssignment': {
        const a = assignment(n.assignmentId);
        return a
          ? [
              {
                ...base,
                kind: n.kind,
                assignmentId: a.id,
                className: className(a.classId),
                title: a.title,
                dueAt: a.dueAt,
              },
            ]
          : [];
      }
      case 'assignmentGraded': {
        const a = assignment(n.assignmentId);
        return a
          ? [
              {
                ...base,
                kind: n.kind,
                assignmentId: a.id,
                title: a.title,
                teacher: teacherName(n.teacherId),
                score: n.score,
                outOf: n.outOf,
              },
            ]
          : [];
      }
      case 'reviewDue':
        return [{ ...base, kind: n.kind, cells: n.cells, minutes: n.minutes }];
      case 'streak':
        return [{ ...base, kind: n.kind, days: n.days }];
      case 'weeklySummary':
        return [{ ...base, kind: n.kind, topics: n.topics, accuracy: n.accuracy }];
      default:
        // Teacher and parent notices never reach the student's list.
        return [];
    }
  });
}

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

export const isUnread = (item: InboxItem) => !item.read;

export function unreadCount(items: InboxItem[]): number {
  return items.filter(isUnread).length;
}

/** Each notification opens the exact screen it is about (deep link, architecture P1). */
export function inboxHref(item: InboxItem): Href {
  switch (item.kind) {
    case 'answerReady':
      return { pathname: '/ask/[id]', params: { id: item.questionId } };
    case 'newAssignment':
    case 'assignmentGraded':
      return { pathname: '/assignment/[id]', params: { id: item.assignmentId } };
    case 'reviewDue':
      return '/review';
    case 'streak':
    case 'weeklySummary':
      return '/me/progress';
  }
}
