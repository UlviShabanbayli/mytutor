import { answerDemo } from '@mytutor/demo-data';
import { classSummarySchema, notificationSchema, studentAssignmentSchema } from '@mytutor/schemas';
import type { DemoEvent } from '@mytutor/types';
import { groupInbox, inboxHref, inboxItems, isUnread, unreadCount } from './inbox';
import type { InboxItem } from './types';

const now = new Date(2026, 9, 18, 15, 0);
const iso = (day: number, h: number, m: number) => new Date(2026, 9, day, h, m).toISOString();

const items: InboxItem[] = [
  { id: 'r', kind: 'reviewDue', at: iso(18, 9, 0), read: true, cells: 3, minutes: 5 },
  { id: 's', kind: 'streak', at: iso(17, 20, 14), read: true, days: 12 },
  { id: 'a', kind: 'answerReady', at: iso(18, 14, 5), read: false, questionId: 'q1', teacher: 'L' },
  { id: 'w', kind: 'weeklySummary', at: iso(14, 19, 0), read: false, topics: 6, accuracy: 82 },
];

describe('groupInbox', () => {
  it('groups by local day, newest first', () => {
    const groups = groupInbox(items, now);
    expect(groups.map((g) => g.relation)).toEqual(['today', 'yesterday', 'other']);
    expect(groups[0]?.items.map((i) => i.id)).toEqual(['a', 'r']);
    expect(groups[2]?.key).toBe('2026-10-14');
  });
});

describe('unread', () => {
  it('counts the items the world has not marked read', () => {
    expect(unreadCount(items)).toBe(2);
    expect(isUnread(items[2] as InboxItem)).toBe(true);
    expect(isUnread(items[0] as InboxItem)).toBe(false);
  });
});

describe('inboxItems', () => {
  const NOW = new Date('2026-10-20T06:00:00.000Z');
  const read = (path: string, events: DemoEvent[] = []) =>
    answerDemo(path, { persona: 'nermin', now: NOW, events }).body;
  const inbox = (events: DemoEvent[] = []) =>
    inboxItems(
      notificationSchema.array().parse(read('/v1/notifications', events)),
      studentAssignmentSchema.array().parse(read('/v1/assignments', events)),
      classSummarySchema.array().parse(read('/v1/classes', events)),
    );

  it("shows Nərmin's notices with the assignment and teacher filled in", () => {
    const list = inbox();
    expect(list.map((i) => i.kind).sort()).toEqual([
      'answerReady',
      'newAssignment',
      'reviewDue',
      'streak',
      'weeklySummary',
    ]);
    const assignment = list.find((i) => i.kind === 'newAssignment');
    expect(assignment).toMatchObject({
      assignmentId: 'quiz-4-2',
      className: '7B',
      title: '4.2 testi',
    });
    expect(list.find((i) => i.kind === 'answerReady')).toMatchObject({ teacher: 'Lalə Həsənova' });
  });

  it('shows the grade once Lalə grades hw-4-1, and a read notice as read', () => {
    const graded: DemoEvent = {
      id: 'e1',
      at: NOW.toISOString(),
      type: 'assignment.graded',
      assignmentId: 'hw-4-1',
      studentId: 'nermin',
      score: 9,
      outOf: 10,
    };
    const notice = inbox([graded]).find((i) => i.kind === 'assignmentGraded');
    expect(notice).toMatchObject({ assignmentId: 'hw-4-1', score: 9, outOf: 10, read: false });
    expect(notice && inboxHref(notice)).toEqual({
      pathname: '/assignment/[id]',
      params: { id: 'hw-4-1' },
    });
    const opened: DemoEvent = {
      id: 'e2',
      at: new Date(NOW.getTime() + 1000).toISOString(),
      type: 'notification.read',
      notificationId: notice?.id ?? '',
    };
    expect(inbox([graded, opened]).find((i) => i.kind === 'assignmentGraded')?.read).toBe(true);
  });
});

describe('inboxHref', () => {
  it('opens the exact screen of each notification', () => {
    expect(inboxHref(items[2] as InboxItem)).toEqual({
      pathname: '/ask/[id]',
      params: { id: 'q1' },
    });
    expect(inboxHref(items[0] as InboxItem)).toBe('/review');
    expect(inboxHref(items[1] as InboxItem)).toBe('/me/progress');
  });
});
