import {
  awaitsPracticeAnswer,
  chatMood,
  classifyMessage,
  isPracticeAnswerCorrect,
  normalize,
  splitBold,
} from './chatScript';
import type { ChatMessage } from './types';

const vizi = (kind: Extract<ChatMessage, { role: 'vizi' }>['kind']): ChatMessage => ({
  id: 'v',
  role: 'vizi',
  kind,
  paragraphs: [],
  sources: [],
  source: null,
  followUp: null,
  suggestions: [],
});

describe('classifyMessage', () => {
  it('knows the cube questions in Azerbaijani and Russian', () => {
    expect(classifyMessage('(a + b)³ niyə a³ + b³ deyil?')).toBe('cubeWhy');
    expect(classifyMessage('Почему (a+b)^3 не равно a^3 + b^3?')).toBe('cubeWhy');
    expect(classifyMessage('Bəs (a − b)³?')).toBe('cubeMinus');
  });

  it('routes the suggestions to their replies', () => {
    expect(classifyMessage('4.3-ü sadə dillə izah et')).toBe('explainTopic');
    expect(classifyMessage('Mənə bir məşq sualı ver')).toBe('practice');
    expect(classifyMessage('Səhvlərimə baxaq')).toBe('mistakes');
    expect(classifyMessage('Дай мне тренировочный вопрос')).toBe('practice');
  });

  it('is unsure about maths it has no source for, and declines everything else', () => {
    expect(
      classifyMessage(
        '4.3-dəki çalışmada cavabım kitabın sonundakı cavabla düz gəlmir. Kim səhvdir?',
      ),
    ).toBe('unsure');
    expect(classifyMessage('2x + 5 = 11 tənliyini həll et')).toBe('unsure');
    expect(classifyMessage('Bu axşam futbol matçını kim udacaq?')).toBe('offtopic');
    expect(classifyMessage('İZAH ET')).toBe('explainTopic');
  });

  it('treats maths right after a practice task as the answer to it', () => {
    expect(classifyMessage('x³ + 3x² + 3x + 1', true)).toBe('practiceAnswer');
    expect(classifyMessage('Səhvlərimə baxaq', true)).toBe('mistakes');
  });
});

describe('isPracticeAnswerCorrect', () => {
  it('accepts the expansion with any spacing or ^ powers', () => {
    expect(isPracticeAnswerCorrect('x³ + 3x² + 3x + 1')).toBe(true);
    expect(isPracticeAnswerCorrect('(x+1)^3 = x^3+3x^2+3x+1')).toBe(true);
    expect(isPracticeAnswerCorrect('x³ + 3x + 1')).toBe(false);
  });
});

describe('awaitsPracticeAnswer and chatMood', () => {
  it('looks at the last message only', () => {
    expect(awaitsPracticeAnswer([vizi('practice')])).toBe(true);
    expect(awaitsPracticeAnswer([vizi('practice'), { id: 's', role: 'student', text: 'x' }])).toBe(
      false,
    );
    expect(awaitsPracticeAnswer([])).toBe(false);
  });

  it('shows thinking, sleepy at the limit, comforting after a decline', () => {
    expect(chatMood([], true, false)).toBe('dusunur');
    expect(chatMood([], false, true)).toBe('yuxulu');
    expect(chatMood([vizi('offtopic')], false, false)).toBe('teselli');
    expect(chatMood([vizi('hint')], false, false)).toBe('izah');
  });
});

describe('normalize and splitBold', () => {
  it('unifies case, minus signs and powers', () => {
    expect(normalize('  İZAH   (a − b)^2 ')).toBe('izah (a - b)²');
  });

  it('splits bold maths and keeps unclosed markers as text', () => {
    expect(splitBold('Kub: **(a + b)³**.')).toEqual([
      { text: 'Kub: ', bold: false },
      { text: '(a + b)³', bold: true },
      { text: '.', bold: false },
    ]);
    expect(splitBold('a ** b')).toEqual([{ text: 'a ** b', bold: false }]);
  });
});
