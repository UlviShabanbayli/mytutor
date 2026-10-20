import type {
  CourseTopic,
  CourseUnit,
  CurriculumSubject,
  Textbook,
  TextbookChoice,
} from '@mytutor/types';
import { R7, R8, RADIUS_7, RADIUS_8, TRIMS_7, topicIdOf, unitIdOf } from '../ids';
import { R7_PART_1 } from './r7part1';
import { R7_PART_2 } from './r7part2';
import { R8 as R8_TOC } from './r8';
import type { TocUnit } from './toc';

/** Topics that build on more than the topic before them. */
const PREREQUISITES: Record<string, string[]> = {
  [topicIdOf(R7, '4.3')]: [topicIdOf(R7, '4.1'), topicIdOf(R7, '3.5')],
};

/** "Cəmin və fərqin kubu. Kublar cəmi və kublar fərqi" → "Cəmin və fərqin kubu". */
export const shortTitleOf = (title: string) => title.split('. ')[0] ?? title;

function units(subjectId: string, toc: TocUnit[]): CourseUnit[] {
  return toc.map((unit) => {
    const unitId = unitIdOf(subjectId, unit.number);
    return {
      id: unitId,
      number: unit.number,
      title: unit.title,
      pages: { start: unit.pages[0], end: unit.pages[1] },
      topics: unit.topics.map(([number, title, start, end], i): CourseTopic => {
        const id = topicIdOf(subjectId, number);
        const previous = unit.topics[i - 1];
        return {
          id,
          unitId,
          number,
          title,
          shortTitle: shortTitleOf(title),
          pages: { start, end },
          prerequisites: PREREQUISITES[id] ?? (previous ? [topicIdOf(subjectId, previous[0])] : []),
        };
      }),
    };
  });
}

/** Only TRİMS 7, part 1 is ready; the rest show "hazırlanır". */
export const TEXTBOOKS: Textbook[] = [
  {
    id: TRIMS_7,
    subjectId: R7,
    name: 'TRİMS',
    title: 'Riyaziyyat 7 (TRİMS)',
    parts: 2,
    volumes: [
      { part: 1, ready: true, units: units(R7, R7_PART_1) },
      { part: 2, ready: false, units: units(R7, R7_PART_2) },
    ],
  },
  {
    id: RADIUS_7,
    subjectId: R7,
    name: 'Radius',
    title: 'Riyaziyyat 7 (Radius)',
    parts: 1,
    volumes: [{ part: 1, ready: false, units: [] }],
  },
  {
    id: RADIUS_8,
    subjectId: R8,
    name: 'Radius',
    title: 'Riyaziyyat 8 (Radius)',
    parts: 1,
    volumes: [{ part: 1, ready: false, units: units(R8, R8_TOC) }],
  },
];

const PREPARING_7: [string, string, string][] = [
  ['azerbaycan-dili', 'Azərbaycan dili', 'Az'],
  ['ingilis-dili', 'İngilis dili', 'İn'],
  ['fizika', 'Fizika', 'Fi'],
  ['biologiya', 'Biologiya', 'Bi'],
  ['tarix', 'Tarix', 'Ta'],
  ['cografiya', 'Coğrafiya', 'Co'],
];

export const SUBJECTS: CurriculumSubject[] = [
  { id: R7, name: 'Riyaziyyat', grade: 7, monogram: 'Ri', textbookIds: [TRIMS_7, RADIUS_7] },
  ...PREPARING_7.map(([id, name, monogram]) => ({
    id: `${id}-7`,
    name,
    grade: 7,
    monogram,
    textbookIds: [],
  })),
  { id: R8, name: 'Riyaziyyat', grade: 8, monogram: 'Ri', textbookIds: [RADIUS_8] },
];

/** The volume every demo student follows: TRİMS 7, part 1. */
export const DEFAULT_CHOICE: TextbookChoice = { subjectId: R7, textbookId: TRIMS_7, part: 1 };

export const READY_UNITS: CourseUnit[] = units(R7, R7_PART_1);
export const READY_TOPICS: CourseTopic[] = READY_UNITS.flatMap((u) => u.topics);

/** The textbook line every demo source starts with. */
export const READY_BOOK = 'Riyaziyyat 7 (TRİMS), 1-ci hissə';

const ALL_TOPICS = new Map(
  TEXTBOOKS.flatMap((b) => b.volumes.flatMap((v) => v.units.flatMap((u) => u.topics))).map((t) => [
    t.id,
    t,
  ]),
);

export function topicById(id: string): CourseTopic | null {
  return ALL_TOPICS.get(id) ?? null;
}

/** A ready topic by id; throws for an id the demo does not have (a bug in the demo data). */
export function readyTopic(id: string): CourseTopic {
  const topic = READY_TOPICS.find((t) => t.id === id);
  if (!topic) throw new Error(`Unknown demo topic ${id}`);
  return topic;
}

/** "Riyaziyyat 7 (TRİMS), 1-ci hissə · 4.3 (s. 90) · demo dərs". */
export function demoSource(topicId: string, what: string): string {
  const topic = readyTopic(topicId);
  return `${READY_BOOK} · ${topic.number} (s. ${topic.pages.start}) · ${what}`;
}

/** "Cəmin və fərqin kubu" of "riyaziyyat-7-4-3". */
export const shortTitle = (topicId: string) => readyTopic(topicId).shortTitle;
