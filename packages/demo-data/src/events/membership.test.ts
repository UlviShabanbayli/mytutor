import { describe, expect, it } from 'vitest';
import type { DemoEvent } from '@mytutor/types';
import { answerDemo } from '../selectors/answer';
import { NOW, ev, get, list } from './testEvents';

describe('demo events for classes and families', () => {
  it('joins and leaves classes; the teacher can remove a student', () => {
    // Joined a minute ago: only what was written since then would be unread.
    const join = {
      ...ev({ type: 'class.joined', classId: '7b', studentId: 'yeni-sagird' }),
      at: '2026-10-20T05:59:00.000Z',
    } as DemoEvent;
    expect(list('/v1/classes', [join], 'fresh').map((c) => c.id)).toEqual(['7b']);
    expect(list('/v1/assignments', [join], 'fresh').map((a) => a.id)).toContain('quiz-4-2');
    expect((get('/v1/messages/chat-7b', [join], 'fresh') as { unread: number }).unread).toBe(0);
    const roster = get('/v1/teacher/classes/7b', [join], 'fresh') as { members: unknown[] };
    expect(roster.members).toHaveLength(25);
    const left = ev({ type: 'class.left', classId: '7b', studentId: 'nermin' });
    expect(list('/v1/classes', [left])).toEqual([]);
    expect(
      answerDemo('/v1/messages/chat-7b', { persona: 'nermin', now: NOW, events: [left] }).status,
    ).toBe(404);
    const removed = ev({ type: 'member.removed', classId: '7b', studentId: 'tural' });
    const after = get('/v1/teacher/classes/7b', [removed]) as { members: { personId: string }[] };
    expect(after.members.map((m) => m.personId)).not.toContain('tural');
  });

  it('Səbinə unlinks and links again with K7Q42M: both sides show the link', () => {
    const unlinked = ev({ type: 'child.unlinked', parentId: 'sebine', childId: 'nermin' });
    const home = get('/v1/parent', [unlinked]) as { children: { childId: string }[] };
    expect(home.children.map((c) => c.childId)).toEqual(['elvin']);
    expect(
      (get('/v1/parent/codes/K7Q42M', [unlinked]) as { alreadyLinked: boolean }).alreadyLinked,
    ).toBe(false);
    const linked = ev({ type: 'child.linked', parentId: 'sebine', childId: 'nermin' });
    const again = get('/v1/parent', [unlinked, linked]) as {
      children: { childId: string; status: string; relation: string }[];
    };
    expect(again.children.find((c) => c.childId === 'nermin')).toMatchObject({
      status: 'active',
      relation: 'mother',
    });
    const me = get('/v1/me', [unlinked, linked]) as {
      parents: { parentId: string; status: string }[];
    };
    expect(me.parents.find((p) => p.parentId === 'sebine')?.status).toBe('active');
    const father = ev({ type: 'child.linked', parentId: 'elcin', childId: 'nermin' });
    const both = get('/v1/me', [father]) as { parents: { parentId: string; status: string }[] };
    expect(both.parents.find((p) => p.parentId === 'elcin')?.status).toBe('active');
  });

  it('decides consent for a child under 13', () => {
    const approve = ev({
      type: 'consent.decided',
      parentId: 'sebine',
      childId: 'elvin',
      approved: true,
    });
    const home = get('/v1/parent', [approve]) as {
      children: { childId: string; status: string; grants: string[] }[];
      consentRequests: unknown[];
    };
    expect(home.children.find((c) => c.childId === 'elvin')).toMatchObject({
      status: 'active',
      grants: ['report', 'progress', 'assignments'],
    });
    expect(home.consentRequests).toEqual([]);
    const decline = ev({
      type: 'consent.decided',
      parentId: 'sebine',
      childId: 'elvin',
      approved: false,
    });
    expect((get('/v1/parent', [decline]) as { children: unknown[] }).children).toHaveLength(1);
  });
});
