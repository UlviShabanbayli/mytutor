import i18n from '@/i18n';
import { buildReply, welcomeReply } from './chatReplies';
import type { ChatIntent } from './types';

const t = i18n.t;
const intents: ChatIntent[] = [
  'greeting',
  'cubeWhy',
  'anotherHint',
  'fullSolution',
  'cubeMinus',
  'explainTopic',
  'practice',
  'practiceAnswer',
  'mistakes',
  'unsure',
  'offtopic',
];

describe('buildReply', () => {
  it('answers every intent with text that has no missing keys', () => {
    for (const intent of intents) {
      const reply = buildReply(t, intent);
      expect(reply.paragraphs.length).toBeGreaterThan(0);
      for (const p of reply.paragraphs) expect(p).not.toMatch(/ask\.demo|\{\{/);
    }
  });

  it('cites the textbook whenever it explains, and never when it declines', () => {
    for (const intent of ['cubeWhy', 'fullSolution', 'cubeMinus', 'explainTopic'] as const) {
      const reply = buildReply(t, intent);
      expect(reply.source).toBe('Riyaziyyat 7 (TRİMS), 1-ci hissə · 4.3 · s. 90');
      expect(reply.sources.length).toBeGreaterThan(0);
    }
    expect(buildReply(t, 'offtopic').source).toBeNull();
    expect(buildReply(t, 'unsure').followUp).toBe('handoff');
  });

  it('gives the full solution only when asked; a hint first', () => {
    expect(buildReply(t, 'cubeWhy').kind).toBe('hint');
    expect(buildReply(t, 'cubeWhy').followUp).toBe('hintActions');
    expect(buildReply(t, 'fullSolution').kind).toBe('solution');
  });

  it('praises a correct practice answer and hints after a wrong one', () => {
    expect(buildReply(t, 'practiceAnswer', true).kind).toBe('praise');
    expect(buildReply(t, 'practiceAnswer', false).kind).toBe('hint');
  });

  it('welcomes with the topic and ready questions', () => {
    const welcome = welcomeReply(t, '4.3');
    expect(welcome.paragraphs[0]).toContain('4.3');
    expect(welcome.suggestions).toHaveLength(3);
  });
});
