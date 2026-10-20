import { describe, expect, it } from 'vitest';
import type { AskQuestion, DemoEvent } from '@mytutor/types';
import { answerDemo } from '../selectors/answer';
import { NOW, ev, get, list } from './testEvents';

/** Events for talking and for questions: read marks, replies, cancelled and edited answers. */

type Thread = {
  messages: { id: string; text: string; replyToId: string | null; status: string }[];
};
const thread = (path: string, events: DemoEvent[]) => get(path, events) as unknown as Thread;
const at = (minutesAgo: number) => new Date(NOW.getTime() - minutesAgo * 60_000).toISOString();

describe('demo events for talking', () => {
  it('thread.read: Səbinə reads Lalə’s message and Lalə sees “Oxundu”', () => {
    const before = thread('/v1/teacher/messages/dm-lale-sebine', []);
    expect(before.messages.at(-1)?.status).toBe('sent');
    const read = {
      ...ev({ type: 'thread.read', threadId: 'dm-lale-sebine', readerId: 'sebine' }),
      at: at(1),
    } as DemoEvent;
    expect(thread('/v1/teacher/messages/dm-lale-sebine', [read]).messages.at(-1)?.status).toBe(
      'read',
    );
    const parent = list('/v1/parent/messages', [read]).find((t) => t.id === 'dm-lale-sebine');
    expect(parent?.unread).toBe(0);
    const stranger = ev({ type: 'thread.read', threadId: 'dm-lale-sebine', readerId: 'nermin' });
    expect(thread('/v1/teacher/messages/dm-lale-sebine', [stranger]).messages.at(-1)?.status).toBe(
      'sent',
    );
  });

  it('message.sent keeps a reply to a message of the same thread', () => {
    const reply = ev({
      type: 'message.sent',
      threadId: 'chat-7b',
      fromPersonId: 'nermin',
      text: 'Bəli',
      replyToId: 'm-7b-6',
    });
    const elsewhere = ev({
      type: 'message.sent',
      threadId: 'chat-7b',
      fromPersonId: 'nermin',
      text: 'Yox',
      replyToId: 'm-sb-1',
    });
    const messages = thread('/v1/messages/chat-7b', [reply, elsewhere]).messages;
    expect(messages.find((m) => m.text === 'Bəli')?.replyToId).toBe('m-7b-6');
    expect(messages.find((m) => m.text === 'Yox')?.replyToId).toBeNull();
  });

  it('parent conversations carry the child’s name', () => {
    const teacher = list('/v1/teacher/messages', []).find((t) => t.id === 'dm-lale-sebine');
    expect(teacher?.childName).toBe('Nərmin Əliyeva');
    expect(list('/v1/teacher/messages', []).find((t) => t.id === 'chat-7b')?.childName).toBeNull();
  });
});

describe('demo events for questions', () => {
  it('ask.cancelled takes back an open question everywhere, never an answered one', () => {
    const cancel = ev({ type: 'ask.cancelled', questionId: 'q-nermin-1', studentId: 'nermin' });
    expect(list('/v1/ask/questions', [cancel]).map((q) => q.id)).not.toContain('q-nermin-1');
    expect(list('/v1/teacher/inbox', [cancel]).map((q) => q.id)).not.toContain('q-nermin-1');
    const notices = list('/v1/teacher/notifications', [cancel]);
    expect(notices.some((n) => n.questionId === 'q-nermin-1')).toBe(false);
    const answered = ev({ type: 'ask.cancelled', questionId: 'q-nermin-2', studentId: 'nermin' });
    expect(list('/v1/ask/questions', [answered]).map((q) => q.id)).toContain('q-nermin-2');
    const other = ev({ type: 'ask.cancelled', questionId: 'q-aysel-1', studentId: 'nermin' });
    expect(list('/v1/teacher/inbox', [other]).map((q) => q.id)).toContain('q-aysel-1');
  });

  it('ask.answered with the teacher’s own steps and another topic', () => {
    const steps = [
      { id: 's1', text: 'Kubu aç', formula: '(2x)³ + 3·(2x)²·3 + 3·2x·3² + 3³', edited: true },
      { id: 's2', text: 'Cavab', formula: '8x³ + 36x² + 54x + 27' },
    ];
    const answer = ev({
      type: 'ask.answered',
      questionId: 'q-nermin-1',
      teacherId: 'lale',
      steps,
      topicId: 'riyaziyyat-7-4-1',
    });
    const q = get('/v1/ask/questions/q-nermin-1', [answer]) as unknown as AskQuestion & {
      topic: { number: string };
    };
    expect([q.answer?.steps, q.answer?.correctedAi, q.topicId, q.topic.number]).toEqual([
      steps,
      true,
      'riyaziyyat-7-4-1',
      '4.1',
    ]);
    expect(q.source).toContain('4.1');
    const unknown = ev({
      type: 'ask.answered',
      questionId: 'q-aysel-1',
      teacherId: 'lale',
      topicId: 'riyaziyyat-9-9-9',
    });
    const aysel = answerDemo('/v1/teacher/inbox/q-aysel-1', {
      persona: 'nermin',
      now: NOW,
      events: [unknown],
    });
    expect((aysel.body as AskQuestion).topicId).toBe('riyaziyyat-7-4-3');
  });
});
