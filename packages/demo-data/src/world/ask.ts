import type { AskQuestion } from '@mytutor/types';
import type { Clock } from '../clock';
import { demoSource } from '../curriculum';
import { r7 } from '../ids';
import { ask, fromClass, step, timeline } from './askParts';
import { nerminQuestions } from './askNermin';

/** Other 7B students' questions waiting in Lalə's inbox. */
function classQuestions(clock: Clock): AskQuestion[] {
  const waiting = { ...fromClass, status: 'teacher_checking' as const, answer: null };
  return [
    ask('aysel', {
      ...waiting,
      id: 'q-aysel-1',
      topicId: r7('4.3'),
      title: 'x³ − 8 ifadəsini vuruqlara ayır',
      mark: 'x³ − 8 = ?',
      note: 'Hansı düsturu işlətməliyəm?',
      timeline: timeline(clock, 18, 17),
      aiDraft: {
        status: 'ready',
        answer: '(x − 2)(x² + 2x + 4)',
        steps: [
          step('s1', 'Düstur', 'a³ − b³ = (a − b)(a² + ab + b²)'),
          step('s2', '8-i 2³ kimi yaz', 'x³ − 8 = x³ − 2³'),
          step('s3', 'Düsturu tətbiq et', '(x − 2)(x² + 2x + 4)'),
        ],
      },
      source: demoSource(r7('4.3'), 'demo'),
    }),
    ask('orxan', {
      ...waiting,
      id: 'q-orxan-1',
      topicId: r7('4.1'),
      title: '(a + 5)² − (a − 5)² ifadəsini sadələşdir',
      mark: '(a+5)² − (a−5)²',
      note: 'Cavabım 20a çıxdı, düzdür?',
      timeline: timeline(clock, 11, 10),
      aiDraft: {
        status: 'ready',
        answer: '20a',
        steps: [
          step('s1', 'Kvadratları aç', '(a² + 10a + 25) − (a² − 10a + 25)'),
          step('s2', 'Mötərizəni aç', 'a² + 10a + 25 − a² + 10a − 25'),
          step('s3', 'Oxşar hədləri topla', '20a'),
        ],
      },
      source: demoSource(r7('4.1'), 'demo'),
    }),
    ask('tural', {
      ...waiting,
      id: 'q-tural-1',
      status: 'sent',
      topicId: r7('3.5'),
      title: '(x + 2)(x − 3) hasilini tap',
      mark: '(x + 2)(x − 3) = ?',
      note: 'Bunu necə həll edim?',
      timeline: timeline(clock, 1),
      aiDraft: { status: 'solving', answer: null, steps: [] },
      source: demoSource(r7('3.5'), 'demo'),
    }),
  ];
}

export const askQuestions = (clock: Clock): AskQuestion[] => [
  ...nerminQuestions(clock),
  ...classQuestions(clock),
];

/** Free plan: photo questions and Vızı messages per day (P4). */
export const ASK_LIMITS = { photo: 3, chat: 6 } as const;
