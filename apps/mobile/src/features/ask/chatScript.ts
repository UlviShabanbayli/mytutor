// Scripted Vızı for the demo, until the AI chat API exists (architecture Ş9): the server will
// find the matching topic, explanations and examples in the knowledge layer and stream Claude's
// reply. Here typed text is matched against a few patterns in Azerbaijani and Russian; anything
// mathematical that the script does not know gets the honest "not sure → ask the teacher" reply,
// anything else is politely declined as off-topic.
import type { ChatIntent, ChatMessage } from './types';

/** Lower case, unified minus and powers, single spaces. */
export function normalize(text: string): string {
  // "İ" first: plain lower-casing turns it into "i" plus a combining dot.
  return text
    .replace(/İ/g, 'i')
    .toLowerCase()
    .replace(/[−–—]/g, '-')
    .replace(/\^3/g, '³')
    .replace(/\^2/g, '²')
    .replace(/\s+/g, ' ')
    .trim();
}

const compact = (text: string) => normalize(text).replace(/\s/g, '');

const PATTERNS: { intent: ChatIntent; test: RegExp }[] = [
  { intent: 'greeting', test: /^(salam|hello|hi|привет|здравствуй)/ },
  { intent: 'mistakes', test: /səhvlərim|ошибк/ },
  { intent: 'practice', test: /məşq|тренировоч|дай (мне )?(задач|пример|вопрос)/ },
  { intent: 'explainTopic', test: /sadə dillə|izah et|объясни|простыми/ },
  {
    intent: 'unsure',
    test: /çalışma|kitabın sonu|cavabım|kim səhv|упражнен|в конце|мой ответ|кто прав/,
  },
  { intent: 'cubeMinus', test: /\(a-b\)³/ },
  { intent: 'cubeWhy', test: /\(a\+b\)³|kub|куб/ },
];

/** Anything that looks like school maths. */
const MATHS =
  /[²³=+*/^√°]|\d|düstur|ifadə|çoxhədli|birhədli|vuruq|kvadrat|bucaq|faiz|tənlik|формул|выражен|многочлен|квадрат|множител|угол|процент|уравнен/;

/** What the student wants from typed text. `afterPractice`: Vızı just gave a practice task. */
export function classifyMessage(text: string, afterPractice = false): ChatIntent {
  const plain = normalize(text);
  if (afterPractice && MATHS.test(plain)) return 'practiceAnswer';
  const squeezed = compact(text);
  for (const { intent, test } of PATTERNS) {
    if (test.test(plain) || test.test(squeezed)) return intent;
  }
  return MATHS.test(plain) ? 'unsure' : 'offtopic';
}

/** The practice task is (x + 1)³; accepts the terms in the usual order with any spacing. */
export function isPracticeAnswerCorrect(text: string): boolean {
  const answer = compact(text).replace(/^\(x\+1\)³=/, '');
  return answer === 'x³+3x²+3x+1';
}

/** True when the last message is Vızı's practice task, so the next one is an answer to it. */
export function awaitsPracticeAnswer(messages: ChatMessage[]): boolean {
  const last = messages[messages.length - 1];
  return last !== undefined && last.role === 'vizi' && last.kind === 'practice';
}

export type TextPart = { text: string; bold: boolean };

/** "a **b** c" → [a, b (bold), c]; an unclosed marker is kept as plain text. */
export function splitBold(text: string): TextPart[] {
  const pieces = text.split('**');
  if (pieces.length % 2 === 0) return [{ text, bold: false }];
  return pieces
    .map((piece, i) => ({ text: piece, bold: i % 2 === 1 }))
    .filter((part) => part.text.length > 0);
}

export type ViziMood = 'izah' | 'dusunur' | 'teselli' | 'yuxulu';

/** Vızı's face in the chat header: thinking, comforting after a decline, sleepy at the limit. */
export function chatMood(
  messages: ChatMessage[],
  thinking: boolean,
  limitReached: boolean,
): ViziMood {
  if (thinking) return 'dusunur';
  if (limitReached) return 'yuxulu';
  const last = messages[messages.length - 1];
  if (last?.role === 'vizi' && last.kind === 'offtopic') return 'teselli';
  if (last?.role === 'vizi' && last.kind === 'unsure') return 'dusunur';
  return 'izah';
}
