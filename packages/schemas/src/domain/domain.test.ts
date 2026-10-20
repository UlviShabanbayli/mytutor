import { describe, expect, it } from 'vitest';
import {
  demoAccountSchema,
  linkCodeSchema,
  masteryMapSchema,
  notificationSchema,
  pageRangeSchema,
  subjectReadinessSchema,
} from '.';
import { phoneNumberSchema } from '../phone';
import { sourceRefSchema } from '../test';

const at = '2026-10-20T09:00:00.000Z';

describe('domain schemas', () => {
  it('reads a mastery map and rejects unknown levels', () => {
    expect(masteryMapSchema.parse({ 'riyaziyyat-7-4-3': 'lesson_completed' })).toEqual({
      'riyaziyyat-7-4-3': 'lesson_completed',
    });
    expect(masteryMapSchema.safeParse({ 'riyaziyyat-7-4-3': 'honey' }).success).toBe(false);
  });

  it('keeps page ranges in order', () => {
    expect(pageRangeSchema.safeParse({ start: 90, end: 93 }).success).toBe(true);
    expect(pageRangeSchema.safeParse({ start: 93, end: 90 }).success).toBe(false);
  });

  it('tells class codes from six-letter parent codes', () => {
    expect(linkCodeSchema.parse({ kind: 'class', code: '7B-MATH-4K2', classId: '7b' }).kind).toBe(
      'class',
    );
    const parent = { kind: 'parent', code: 'K7Q42M', childId: 'nermin', expiresAt: at };
    expect(linkCodeSchema.safeParse(parent).success).toBe(true);
    expect(linkCodeSchema.safeParse({ ...parent, code: 'k7q42m' }).success).toBe(false);
  });

  it('reads each role’s notifications by kind', () => {
    const base = { id: 'n1', recipientId: 'nermin', role: 'student', at, read: false };
    expect(notificationSchema.safeParse({ ...base, kind: 'streak', days: 12 }).success).toBe(true);
    expect(notificationSchema.safeParse({ ...base, kind: 'streak' }).success).toBe(false);
  });

  it('gives readiness only to a subject with content', () => {
    expect(subjectReadinessSchema.safeParse({ subject: 'physics', ready: false }).success).toBe(
      true,
    );
    expect(subjectReadinessSchema.safeParse({ subject: 'math', ready: true }).success).toBe(false);
  });

  it('accepts demo phones that also pass the app’s phone validation', () => {
    const account = {
      phone: '+994500000001',
      role: 'student',
      persona: 'nermin',
      personId: 'nermin',
      label: 'Nərmin',
    };
    expect(demoAccountSchema.parse(account).phone).toBe(phoneNumberSchema.parse('050 000 00 01'));
  });

  it('marks demo sources', () => {
    const source = { kind: 'textbook', title: 'Riyaziyyat 7', section: '4.3 · demo', demo: true };
    expect(sourceRefSchema.parse(source).demo).toBe(true);
  });
});
