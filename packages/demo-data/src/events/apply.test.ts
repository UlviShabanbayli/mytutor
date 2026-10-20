import { describe, expect, it } from 'vitest';
import { DEMO_EVENT_TYPES, demoWorldSchema } from '@mytutor/schemas';
import type { DemoEvent } from '@mytutor/types';
import { buildDemoWorld } from '../world';
import { applyDemoEvents } from './apply';
import { NOW, ev, get, grade, list } from './testEvents';

describe('applyDemoEvents', () => {
  it('is pure: the world it is given never changes, no events give the same world', () => {
    const world = buildDemoWorld({ now: NOW, persona: 'nermin' });
    const before = JSON.stringify(world);
    const after = applyDemoEvents(world, [grade]);
    expect(JSON.stringify(world)).toBe(before);
    expect(after).not.toBe(world);
    expect(applyDemoEvents(world, [])).toBe(world);
    expect(() => demoWorldSchema.parse(after)).not.toThrow();
  });

  it('applies events in time order and ignores events that point at nothing', () => {
    const world = buildDemoWorld({ now: NOW, persona: 'nermin' });
    const unknown = [
      ev({
        type: 'assignment.graded',
        assignmentId: 'hw-9-9',
        studentId: 'nermin',
        score: 1,
        outOf: 2,
      }),
      ev({ type: 'message.sent', threadId: 'nope', fromPersonId: 'nermin', text: 'x' }),
      ev({ type: 'message.sent', threadId: 'dm-lale-orxan', fromPersonId: 'nermin', text: 'x' }),
      ev({ type: 'ask.answered', questionId: 'nope', teacherId: 'lale' }),
      ev({ type: 'class.joined', classId: '9z', studentId: 'nermin' }),
      ev({ type: 'child.linked', parentId: 'nobody', childId: 'nermin' }),
      ev({ type: 'notification.read', notificationId: 'nope' }),
    ];
    expect(JSON.stringify(applyDemoEvents(world, unknown))).toBe(JSON.stringify(world));
    const late = { ...grade, id: 'late', at: NOW.toISOString(), score: 6 } as DemoEvent;
    const swapped = applyDemoEvents(world, [late, grade]);
    expect(swapped.submissions.find((s) => s.id === 'sub-hw-4-1-nermin')?.grade?.score).toBe(6);
  });
  it('marks notifications read', () => {
    const read = ev({ type: 'notification.read', notificationId: 'n-st-answer' });
    expect(list('/v1/notifications', [read]).find((x) => x.id === 'n-st-answer')?.read).toBe(true);
  });

  it('sets the exam goal: the exam follows without a query parameter', () => {
    const goal = ev({
      type: 'exam.goalSet',
      goal: { kind: 'exam', exam: 'graduation_9', group: null, date: null },
    });
    const exam = get('/v1/exam', [goal]) as {
      goal: { kind: string };
      readiness: { subject: string; percent?: number }[];
    };
    expect(exam.goal.kind).toBe('exam');
    expect(exam.readiness.find((r) => r.subject === 'math')?.percent).toBe(58);
    expect(
      (get('/v1/me', [goal]) as { profile: { goal: { kind: string } } }).profile.goal.kind,
    ).toBe('exam');
    const back = ev({ type: 'exam.goalSet', goal: { kind: 'school' } });
    expect((get('/v1/exam', [goal, back]) as { plan: unknown }).plan).toBeNull();
  });

  it('has a test for every event type', () => {
    const tested = new Set([
      'assignment.created',
      'assignment.submitted',
      'assignment.graded',
      'message.sent',
      'ask.sent',
      'ask.answered',
      'class.joined',
      'class.left',
      'member.removed',
      'child.linked',
      'child.unlinked',
      'consent.decided',
      'notification.read',
      'exam.goalSet',
    ]);
    expect(DEMO_EVENT_TYPES.filter((t) => !tested.has(t))).toEqual([]);
  });
});
