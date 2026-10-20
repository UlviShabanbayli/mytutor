import {
  buildDemoWorld,
  selectNotifications,
  selectParentHome,
  selectParentNotes,
  selectThread,
  selectThreads,
} from '@mytutor/demo-data';
import type { ChildAssignment, ParentHome } from '@mytutor/types';
import { toAssignmentItem, toChildViews, toConversations, toNotifications, toThread } from './map';

const world = buildDemoWorld({ now: new Date('2026-10-20T06:00:00.000Z'), persona: 'nermin' });
const home = selectParentHome(world) as ParentHome;
const notifications = selectNotifications(world, 'parent');
const threads = selectThreads(world, 'parent');
const notes = selectParentNotes(world);
/** Səbinə after she stopped following Nərmin. */
const unlinked: ParentHome = {
  ...home,
  children: home.children.filter((c) => c.childId !== 'nermin'),
};

describe('toChildViews', () => {
  it('marks the week new while its report notification is unread', () => {
    expect(toChildViews(home, notifications)[0]?.week?.reportIsNew).toBe(true);
    const read = notifications.map((n) => ({ ...n, read: true }));
    expect(toChildViews(home, read)[0]?.week?.reportIsNew).toBe(false);
  });
});

describe('toAssignmentItem', () => {
  const base: ChildAssignment = {
    id: 'hw',
    title: 'Ev tapşırığı',
    dueAt: '2026-10-19T19:59:00.000Z',
    state: 'not_started',
    late: false,
    lateDays: 0,
    progress: null,
    submittedAt: null,
    onTime: true,
    kind: 'homework',
    grade: null,
  };

  it('shows late work as late and a mock grade in percent', () => {
    expect(toAssignmentItem({ ...base, late: true, lateDays: 1 }).state).toBe('late');
    expect(
      toAssignmentItem({ ...base, state: 'checked', grade: { score: 8, max: 10 } }).score,
    ).toEqual({ kind: 'points', value: 8, max: 10 });
    expect(
      toAssignmentItem({ ...base, kind: 'mock', state: 'checked', grade: { score: 17, max: 20 } })
        .score,
    ).toEqual({ kind: 'percent', value: 85 });
  });
});

describe('conversations', () => {
  it("lists Lalə as Nərmin's teacher with 7B's note and her unread message", () => {
    const [lale] = toConversations(threads, home, notes);
    expect(lale).toMatchObject({
      threadId: 'dm-lale-sebine',
      name: 'Lalə Həsənova',
      firstName: 'Lalə',
      classLabel: '7B · Riyaziyyat',
      childName: 'Nərmin',
      unread: 1,
      latestNote: { className: '7B' },
    });
  });

  it('counts nothing unread once the parent opened the thread on this device', () => {
    const [lale] = toConversations(threads, home, notes, { 'dm-lale-sebine': world.now });
    expect(lale?.unread).toBe(0);
  });

  it('closes the conversation when the link stops', () => {
    expect(toConversations(threads, unlinked, notes)).toEqual([]);
    const detail = selectThread(world, 'dm-lale-sebine', 'parent');
    expect(detail && toThread(detail, unlinked, notes)).toBeNull();
  });

  it("tells the parent's own messages from the teacher's", () => {
    const detail = selectThread(world, 'dm-lale-sebine', 'parent');
    const thread = detail && toThread(detail, home, notes);
    expect(thread?.messages.map((m) => m.from)).toEqual(['teacher', 'me', 'teacher']);
  });
});

describe('toNotifications', () => {
  it('keeps notifications about linked children only', () => {
    expect(toNotifications(notifications, home, threads)).toMatchObject({
      unread: 2,
      items: [{ kind: 'teacher_message' }, { kind: 'weekly_report', childName: 'Nərmin' }],
    });
    expect(toNotifications(notifications, unlinked, threads).items).toEqual([]);
  });
});
