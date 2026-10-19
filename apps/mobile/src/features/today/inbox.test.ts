import { groupInbox, inboxHref, isUnread, unreadCount } from './inbox';
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
  it('counts items neither read on the server nor on this device', () => {
    expect(unreadCount(items, [])).toBe(2);
    expect(unreadCount(items, ['a'])).toBe(1);
    expect(isUnread(items[2] as InboxItem, ['a'])).toBe(false);
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
