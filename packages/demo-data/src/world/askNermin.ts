import type { AskQuestion } from '@mytutor/types';
import type { Clock } from '../clock';
import { demoSource } from '../curriculum';
import { LALE, NERMIN, RESAD, r7 } from '../ids';
import { ask, DAY, fromClass, step, timeline } from './askParts';

/**
 * Nərmin's photo questions. `q-nermin-1` (2x + 3)³ is the same in her Ask and Lalə's inbox:
 * the AI draft is ready and Lalə has not answered yet.
 */

const CUBE = [
  step('s1', 'Cəmin kubu düsturunu yaz:', '(a + b)³ = a³ + 3a²b + 3ab² + b³'),
  step(
    's2',
    'a-nın yerinə 2x, b-nin yerinə 3 qoy. Diqqət: (2x)² = 4x².',
    '(2x)³ + 3·(2x)²·3 + 3·2x·3² + 3³',
  ),
  step('s3', 'Hər həddi hesabla — cavab:', '8x³ + 36x² + 54x + 27'),
];

export function nerminQuestions(clock: Clock): AskQuestion[] {
  return [
    ask(NERMIN, {
      ...fromClass,
      id: 'q-nermin-1',
      topicId: r7('4.3'),
      title: '(2x + 3)³ ifadəsini çoxhədli şəklində yaz',
      mark: '(2x+3)³',
      note: 'Düsturu bilirəm, amma 3·(2x)²·3 hissəsində ilişdim.',
      status: 'teacher_checking',
      timeline: timeline(clock, 14, 13),
      aiDraft: { status: 'ready', answer: '(2x + 3)³ = 8x³ + 36x² + 54x + 27', steps: CUBE },
      answer: null,
      source: demoSource(r7('4.3'), 'demo'),
      similar: [
        {
          id: 'q-nermin-1-s1',
          text: '(x − 2)³ ifadəsini çoxhədli şəklində yaz',
          source: demoSource(r7('4.3'), 'demo'),
          topicId: r7('4.3'),
        },
        {
          id: 'q-nermin-1-s2',
          text: '(3a + 1)³ ifadəsində mötərizəni aç',
          source: demoSource(r7('4.3'), 'demo'),
          topicId: r7('4.3'),
        },
      ],
    }),
    ask(NERMIN, {
      ...fromClass,
      id: 'q-nermin-2',
      topicId: r7('5.6'),
      title: 'Trapesiyanın orta xəttini tap: oturacaqlar 6 sm və 10 sm',
      mark: 'MN = ?',
      note: '',
      status: 'answered',
      timeline: timeline(clock, 180, 179, 166),
      aiDraft: null,
      answer: {
        teacherId: LALE,
        steps: [
          step('s1', 'Orta xətt oturacaqların cəminin yarısıdır:', 'MN = (a + b) / 2'),
          step('s2', 'Ədədləri yerinə qoy:', 'MN = (6 + 10) / 2'),
          step('s3', 'Cavab:', 'MN = 8 sm'),
        ],
        teacherNote: null,
        correctedAi: false,
      },
      source: demoSource(r7('5.6'), 'demo'),
    }),
    ask(NERMIN, {
      ...fromClass,
      id: 'q-nermin-3',
      topicId: r7('4.5'),
      title: 'x² − 9 ifadəsini vuruqlara ayır',
      mark: 'x²−9',
      note: '',
      status: 'answered',
      timeline: timeline(clock, DAY + 60, DAY + 59, DAY + 46),
      aiDraft: null,
      answer: {
        teacherId: LALE,
        steps: [
          step('s1', '9-u kvadrat kimi yaz:', 'x² − 9 = x² − 3²'),
          step('s2', 'Kvadratlar fərqi düsturunu tətbiq et:', 'a² − b² = (a − b)(a + b)'),
          step('s3', 'Cavab:', 'x² − 9 = (x − 3)(x + 3)'),
        ],
        teacherNote: 'Yoxlamaq üçün mötərizələri bir-birinə vur — x² − 9 alınmalıdır.',
        correctedAi: false,
      },
      source: demoSource(r7('4.5'), 'demo'),
      similar: [
        {
          id: 'q-nermin-3-s1',
          text: 'y² − 16 ifadəsini vuruqlara ayır',
          source: demoSource(r7('4.5'), 'demo'),
          topicId: r7('4.5'),
        },
        {
          id: 'q-nermin-3-s2',
          text: '4x² − 1 ifadəsini vuruqlara ayır',
          source: demoSource(r7('4.5'), 'demo'),
          topicId: r7('4.5'),
        },
      ],
    }),
    ask(NERMIN, {
      ...fromClass,
      id: 'q-nermin-4',
      topicId: r7('2.4'),
      title: 'Mürəkkəb faiz: 1000 manat, illik 10%, 3 ildən sonra',
      mark: '1,1³',
      note: '',
      status: 'answered',
      timeline: timeline(clock, DAY + 200, DAY + 199, DAY + 170),
      aiDraft: null,
      answer: {
        teacherId: LALE,
        steps: [
          step('s1', 'Hər il məbləğ 1,1 dəfə artır:', '1000 · 1,1 = 1100'),
          step('s2', '3 il üçün:', '1000 · 1,1³ = 1000 · 1,331'),
          step('s3', 'Cavab:', '1331 manat'),
        ],
        teacherNote: 'AI hər il 100 manat əlavə etmişdi — faiz hər il artmış məbləğdən hesablanır.',
        correctedAi: true,
      },
      source: demoSource(r7('2.4'), 'demo'),
    }),
    ask(NERMIN, {
      id: 'q-nermin-5',
      classId: null,
      queue: 'general',
      teacherId: RESAD,
      topicId: r7('5.3'),
      title: 'Paraleloqramın bir bucağı 70°-dir. Qalan bucaqlarını tap',
      mark: '∠A, ∠B',
      note: '',
      status: 'answered',
      timeline: timeline(clock, 3 * DAY + 120, 3 * DAY + 119, 3 * DAY + 90),
      aiDraft: null,
      answer: {
        teacherId: RESAD,
        steps: [
          step('s1', 'Qarşı bucaqlar bərabərdir:', '∠C = ∠A = 70°'),
          step('s2', 'Qonşu bucaqların cəmi 180°-dir:', '∠B = ∠D = 180° − 70° = 110°'),
          step('s3', 'Cavab:', '70°, 110°, 70°, 110°'),
        ],
        teacherNote: null,
        correctedAi: false,
      },
      source: demoSource(r7('5.3'), 'demo'),
    }),
  ];
}
