// Vızı's scripted demo replies (until the AI chat API exists, architecture Ş9). Every reply
// with textbook content carries its sources; declines and "not sure" carry none.
import type { TFunction } from 'i18next';
import type { ask as azAsk } from '@/i18n/locales/az/ask';
import { CURRENT_TOPIC, demoTopicId } from './demo';
import type { ChatIntent, ChatMessage, ChatSourceChip } from './types';

type ViziMessage = Extract<ChatMessage, { role: 'vizi' }>;
type ChatKey = keyof typeof azAsk.demo.chat;

let counter = 0;
export const nextMessageId = () => `m${Date.now().toString(36)}${(counter += 1)}`;

function lessonChip(t: TFunction): ChatSourceChip {
  return {
    label: t('ask.demo.chat.sourceLesson', {
      topic: CURRENT_TOPIC.number,
      page: CURRENT_TOPIC.page,
    }),
    lessonId: demoTopicId(CURRENT_TOPIC.number),
  };
}

function exampleChip(t: TFunction): ChatSourceChip {
  return {
    label: t('ask.demo.chat.sourceExample', { n: 2, page: CURRENT_TOPIC.page + 1 }),
    lessonId: demoTopicId(CURRENT_TOPIC.number),
  };
}

const bookSource = (t: TFunction) =>
  t('ask.demo.source', { topic: CURRENT_TOPIC.number, page: CURRENT_TOPIC.page });

export function suggestionsFor(t: TFunction): string[] {
  return [
    t('ask.demo.chat.suggestExplain', { topic: CURRENT_TOPIC.number }),
    t('ask.demo.chat.suggestPractice'),
    t('ask.demo.chat.suggestMistakes'),
  ];
}

function reply(
  kind: ViziMessage['kind'],
  paragraphs: string[],
  extra: Partial<Pick<ViziMessage, 'sources' | 'source' | 'followUp' | 'suggestions'>> = {},
): ViziMessage {
  return {
    id: nextMessageId(),
    role: 'vizi',
    kind,
    paragraphs,
    sources: extra.sources ?? [],
    source: extra.source ?? null,
    followUp: extra.followUp ?? null,
    suggestions: extra.suggestions ?? [],
  };
}

/** The first message of an empty chat: who Vızı is and what to ask. */
export function welcomeReply(t: TFunction, topicLabel: string): ViziMessage {
  return reply(
    'welcome',
    [t('ask.demo.chat.welcome1', { topic: topicLabel }), t('ask.demo.chat.welcome2')],
    {
      followUp: 'suggestions',
      suggestions: [t('ask.demo.chat.seedQuestion'), ...suggestionsFor(t).slice(0, 2)],
    },
  );
}

/** Vızı's answer to one student message. */
export function buildReply(t: TFunction, intent: ChatIntent, practiceCorrect = false): ViziMessage {
  const c = (key: ChatKey) => t(`ask.demo.chat.${key}`);
  const withBook = { sources: [lessonChip(t)], source: bookSource(t) };

  switch (intent) {
    case 'cubeWhy':
      return reply('hint', [c('hint1'), c('hint2')], {
        sources: [lessonChip(t), exampleChip(t)],
        source: bookSource(t),
        followUp: 'hintActions',
      });
    case 'anotherHint':
      return reply('hint', [c('another1'), c('another2')], {
        ...withBook,
        followUp: 'hintActions',
      });
    case 'fullSolution':
      return reply('solution', [c('solution1'), c('solution2'), c('solution3'), c('solution4')], {
        sources: [lessonChip(t), exampleChip(t)],
        source: bookSource(t),
      });
    case 'cubeMinus':
      return reply('explain', [c('minus1')], withBook);
    case 'explainTopic':
      return reply('explain', [c('explain1'), c('explain2'), c('explain3')], withBook);
    case 'practice':
      return reply('practice', [c('practice1'), c('practice2')], withBook);
    case 'practiceAnswer':
      return practiceCorrect
        ? reply('praise', [c('praise1'), c('praise2')], withBook)
        : reply('hint', [c('retry1'), c('retry2')], withBook);
    case 'mistakes':
      return reply('mistakes', [c('mistakes1')], { followUp: 'mistakesLink' });
    case 'unsure':
      return reply('unsure', [c('unsure1')], { followUp: 'handoff' });
    case 'greeting':
      return welcomeReply(t, CURRENT_TOPIC.number);
    case 'offtopic':
      return reply('offtopic', [c('offtopic1'), c('offtopic2')], {
        followUp: 'suggestions',
        suggestions: suggestionsFor(t),
      });
  }
}
