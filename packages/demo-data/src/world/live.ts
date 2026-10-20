import type { LiveLesson } from '@mytutor/types';
import type { Clock } from '../clock';
import { demoSource } from '../curriculum';
import { CLASS_7B, LALE, NERMIN, r7 } from '../ids';

/** 7B's live lesson "4.2 təkrarı": tomorrow 18:00, 45 minutes, recorded. */
export function liveLessons(clock: Clock): LiveLesson[] {
  return [
    {
      id: 'live-7b-4-2',
      classId: CLASS_7B,
      teacherId: LALE,
      topicId: r7('4.2'),
      title: '4.2 təkrarı',
      startsAt: clock.at(1, 18, 0),
      minutes: 45,
      recorded: true,
      board: [
        { text: '(a + b)(a − b) = a² − b²', tone: 'ink', size: 'lg' },
        { text: '(x + 4)(x − 4) = x² − 16', tone: 'honey', size: 'md' },
        { text: '51 · 49 = 50² − 1² = 2499', tone: 'honey', size: 'lg', indent: true },
      ],
      room: {
        present: 21,
        participants: [
          { personId: LALE, state: 'speaking' },
          { personId: NERMIN, state: 'muted' },
          { personId: 'orxan', state: 'hand' },
          { personId: 'tural', state: 'weak' },
        ],
        hands: [
          { personId: 'orxan', at: clock.at(1, 18, 12) },
          { personId: 'aysel', at: clock.at(1, 18, 13) },
        ],
        chatUnread: 3,
      },
      source: demoSource(r7('4.2'), 'demo'),
    },
  ];
}
