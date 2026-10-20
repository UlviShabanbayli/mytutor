import type { ChatMessage, ChatThread } from '@mytutor/types';
import type { Clock } from '../clock';
import { CLASS_7A, CLASS_7B, LALE, NERMIN, SEBINE } from '../ids';
import { ROSTER_7A, ROSTER_7B, rosterId7A } from '../people';

/** Class chats and Lalə's conversations with Səbinə and Orxan. */

export const THREAD_7B = 'chat-7b';
export const THREAD_7A = 'chat-7a';
export const THREAD_SEBINE = 'dm-lale-sebine';
export const THREAD_ORXAN = 'dm-lale-orxan';

export function threads(clock: Clock): ChatThread[] {
  return [
    {
      id: THREAD_7B,
      kind: 'class',
      classId: CLASS_7B,
      memberIds: [LALE, ...ROSTER_7B.map(([id]) => id)],
      childId: null,
      readAt: { [NERMIN]: clock.ago(110), [LALE]: clock.ago(100) },
    },
    {
      id: THREAD_7A,
      kind: 'class',
      classId: CLASS_7A,
      memberIds: [LALE, ...ROSTER_7A.map((_, i) => rosterId7A(i))],
      childId: null,
      readAt: { [LALE]: clock.ago(26 * 60) },
    },
    {
      id: THREAD_SEBINE,
      kind: 'parent',
      classId: null,
      memberIds: [LALE, SEBINE],
      childId: NERMIN,
      readAt: { [SEBINE]: clock.ago(400), [LALE]: clock.ago(60) },
    },
    {
      id: THREAD_ORXAN,
      kind: 'student',
      classId: null,
      memberIds: [LALE, 'orxan'],
      childId: null,
      readAt: { orxan: clock.ago(49 * 60), [LALE]: clock.ago(49 * 60) },
    },
  ];
}

export function messages(clock: Clock): ChatMessage[] {
  const msg = (
    threadId: string,
    id: string,
    authorId: string | null,
    text: string,
    at: string,
    replyToId: string | null = null,
  ): ChatMessage => ({ id, threadId, authorId, text, at, replyToId, reported: false });
  return [
    msg(THREAD_7B, 'm-7b-1', NERMIN, '4.1 tapşırığını göndərdim, müəllim.', clock.at(-1, 21, 20)),
    msg(
      THREAD_7B,
      'm-7b-2',
      LALE,
      'Sabahkı canlı dərsdə 4.2-ni təkrarlayacağıq. Sualınız varsa, bu gün yazın.',
      clock.ago(140),
    ),
    msg(THREAD_7B, 'm-7b-3', 'aysel', '(a − 3)² açanda a² − 6a + 9 alınır?', clock.ago(120)),
    msg(
      THREAD_7B,
      'm-7b-4',
      'tural',
      'Testin cavablarını kim atsın, hamımız köçürək',
      clock.ago(100),
    ),
    msg(THREAD_7B, 'm-7b-5', NERMIN, 'Mən də eyni cavabı aldım', clock.ago(95), 'm-7b-3'),
    msg(THREAD_7B, 'm-7b-6', 'tural', 'Üçüncü misal mənə aydın deyil.', clock.ago(25)),
    msg(THREAD_7A, 'm-7a-1', LALE, '4.1 testi 3 gün ərzində açıqdır.', clock.ago(26 * 60)),
    msg(
      THREAD_SEBINE,
      'm-sb-1',
      LALE,
      'Salam, Səbinə xanım! Nərmin bu həftə çox səliqəli işləyib. 4.3-də kiçik çətinlik var, dərsdə üstündən keçəcəyik.',
      clock.ago(8 * 60),
    ),
    msg(
      THREAD_SEBINE,
      'm-sb-2',
      SEBINE,
      'Çox sağ olun, Lalə xanım. Evdə də kub düsturlarına baxarıq.',
      clock.ago(7 * 60),
    ),
    msg(
      THREAD_SEBINE,
      'm-sb-3',
      LALE,
      'Sabah 18:00-da canlı dərs olacaq, Nərmin qoşulsa yaxşı olar.',
      clock.ago(60),
    ),
    msg(THREAD_ORXAN, 'm-or-1', 'orxan', '4.2-ni yenə başa düşmədim.', clock.ago(50 * 60)),
    msg(THREAD_ORXAN, 'm-or-2', LALE, 'Sabah dərsdən sonra birlikdə baxaq.', clock.ago(49 * 60)),
  ];
}
