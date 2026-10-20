import { describe, expect, it } from 'vitest';
import type { DemoEvent } from '@mytutor/types';
import { NOW, ev, get, list } from './testEvents';

/** Events for running a class: what the teacher does, and what students see. */

type Detail = {
  class: { groups: { id: string; memberIds: string[] }[]; chatOpen: boolean };
  members: { personId: string; mutedInChat: boolean }[];
  announcements: { text: string }[];
};
const detail = (events: DemoEvent[]) => get('/v1/teacher/classes/7b', events) as unknown as Detail;
type Thread = {
  messages: { id: string; text: string; replyToId: string | null; status: string }[];
};
const thread = (path: string, events: DemoEvent[], persona: 'nermin' | 'fresh' = 'nermin') =>
  get(path, events, persona) as unknown as Thread;
const at = (minutesAgo: number) => new Date(NOW.getTime() - minutesAgo * 60_000).toISOString();

const created = ev({
  type: 'class.created',
  class: {
    id: '7c',
    shortName: '7C',
    name: '7C · Riyaziyyat',
    subjectId: 'riyaziyyat-7',
    subject: 'Riyaziyyat',
    grade: 7,
    teacherId: 'lale',
    joinCode: '7C-MATH-2Q8',
    paid: false,
    groups: [],
    chatOpen: true,
  },
});

describe('demo events for running a class', () => {
  it('class.created: Lalə has the class, its code lets a student join, its chat works', () => {
    const home = get('/v1/teacher', [created]) as {
      classes: { id: string; studentCount: number }[];
    };
    expect(home.classes.find((c) => c.id === '7c')?.studentCount).toBe(0);
    const preview = get('/v1/classes/join/7c-math-2q8', [created], 'fresh') as { id: string };
    expect(preview.id).toBe('7c');
    const join = ev({ type: 'class.joined', classId: '7c', studentId: 'yeni-sagird' });
    expect(list('/v1/classes', [created, join], 'fresh').map((c) => c.id)).toEqual(['7c']);
    const hello = ev({
      type: 'message.sent',
      threadId: 'chat-7c',
      fromPersonId: 'lale',
      text: 'Xoş gəldiniz!',
    });
    const chat = thread('/v1/messages/chat-7c', [created, join, hello], 'fresh');
    expect(chat.messages.map((m) => m.text)).toEqual(['Xoş gəldiniz!']);
    const same = ev({
      ...created,
      type: 'class.created',
      class: { ...(created as Extract<DemoEvent, { type: 'class.created' }>).class, id: '7d' },
    });
    const twice = get('/v1/teacher', [created, same]) as { classes: { id: string }[] };
    expect(twice.classes.map((c) => c.id)).not.toContain('7d');
  });

  it('announcement.posted: the teacher’s class page and the students’ feed show it', () => {
    const post = ev({
      type: 'announcement.posted',
      classId: '7b',
      authorId: 'lale',
      text: 'Sabah test var.',
    });
    expect(detail([post]).announcements.map((a) => a.text)).toContain('Sabah test var.');
    const feed = get('/v1/classes/7b', [post]) as { announcements: { text: string }[] };
    expect(feed.announcements.map((a) => a.text)).toContain('Sabah test var.');
    const notTeacher = ev({
      type: 'announcement.posted',
      classId: '7b',
      authorId: 'nermin',
      text: 'Salam',
    });
    expect(detail([notTeacher]).announcements.map((a) => a.text)).not.toContain('Salam');
  });

  it('group.saved: new and changed groups keep only the class’s students', () => {
    const group = ev({
      type: 'group.saved',
      classId: '7b',
      group: { id: 'olympiad', name: 'Olimpiada', memberIds: ['aysel', 'fidan', 'anar'] },
    });
    const changed = ev({
      type: 'group.saved',
      classId: '7b',
      group: { id: 'boost', name: 'Gücləndirmə qrupu', memberIds: ['orxan'] },
    });
    const groups = detail([group, changed]).class.groups;
    expect(groups.find((g) => g.id === 'olympiad')?.memberIds).toEqual(['aysel', 'fidan']);
    expect(groups.find((g) => g.id === 'boost')?.memberIds).toEqual(['orxan']);
  });

  it('member.removed takes the student out of the class’s groups too', () => {
    const removed = ev({ type: 'member.removed', classId: '7b', studentId: 'tural' });
    expect(detail([removed]).class.groups.find((g) => g.id === 'boost')?.memberIds).not.toContain(
      'tural',
    );
  });

  it('member.muted and class.chatSet: who may still post in the class chat', () => {
    const mute = ev({ type: 'member.muted', classId: '7b', studentId: 'nermin', muted: true });
    const muted = ev({
      type: 'message.sent',
      threadId: 'chat-7b',
      fromPersonId: 'nermin',
      text: 'Səssiz',
    });
    expect(detail([mute]).members.find((m) => m.personId === 'nermin')?.mutedInChat).toBe(true);
    expect(thread('/v1/messages/chat-7b', [mute, muted]).messages.map((m) => m.text)).not.toContain(
      'Səssiz',
    );
    const close = ev({ type: 'class.chatSet', classId: '7b', open: false });
    const student = ev({
      type: 'message.sent',
      threadId: 'chat-7b',
      fromPersonId: 'aysel',
      text: 'Bağlı?',
    });
    const teacher = ev({
      type: 'message.sent',
      threadId: 'chat-7b',
      fromPersonId: 'lale',
      text: 'Bağlıdır.',
    });
    expect(detail([close]).class.chatOpen).toBe(false);
    const texts = thread('/v1/messages/chat-7b', [close, student, teacher]).messages.map(
      (m) => m.text,
    );
    expect([texts.includes('Bağlı?'), texts.includes('Bağlıdır.')]).toEqual([false, true]);
  });

  it('material.saved: a draft stays the teacher’s; sent to 7B it shows in the class feed', () => {
    const material = {
      id: 'mat-4-4-test',
      ownerId: 'lale',
      kind: 'test' as const,
      title: '4.4 · Vuruqlara ayırma',
      topicId: 'riyaziyyat-7-4-4',
      classIds: [],
      size: 5,
      state: 'draft' as const,
      updatedAt: at(10),
    };
    const draft = ev({ type: 'material.saved', material });
    expect(list('/v1/teacher/materials', [draft]).map((m) => m.id)).toContain('mat-4-4-test');
    const sent = ev({
      type: 'material.saved',
      material: { ...material, state: 'class', classIds: ['7b', '9z'] },
    });
    const feed = get('/v1/classes/7b', [draft, sent]) as {
      materials: { id: string; classIds: string[] }[];
    };
    expect(feed.materials.find((m) => m.id === 'mat-4-4-test')?.classIds).toEqual(['7b']);
  });
});
