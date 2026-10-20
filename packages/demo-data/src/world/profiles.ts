import type {
  Badge,
  ChildLink,
  LeagueRow,
  LinkCode,
  ParentProfile,
  Rank,
  RankId,
  StudentProfile,
  TeacherProfile,
} from '@mytutor/types';
import { accountOf, maskPhone } from '../accounts';
import type { Clock } from '../clock';
import { CLASS_7A, CLASS_7B, ELCIN, ELVIN, FRESH, LALE, NERMIN, R7, SEBINE } from '../ids';
import { JOIN_CODE_7A, JOIN_CODE_7B } from './classes';

/** Profiles of the persona student, Lalə and Səbinə; links, codes, ranks, badges, league. */

export const RANKS: Rank[] = [
  { id: 'larva', minPoints: 0 },
  { id: 'young', minPoints: 500 },
  { id: 'worker', minPoints: 2000 },
  { id: 'honeyMaster', minPoints: 6000 },
  { id: 'hiveMaster', minPoints: 15000 },
];

export const rankFor = (points: number): RankId =>
  [...RANKS].reverse().find((r) => points >= r.minPoints)?.id ?? 'larva';

export const NERMIN_NICKNAME = 'BalArısı_27';

/** This week's Lalə league (country): nicknames only; Nərmin's 340 points are 6th. */
export const COUNTRY_LEAGUE: [nickname: string, points: number][] = [
  ['Kəpənək_09', 610],
  ['Nar_dənəsi', 545],
  ['Ulduz_77', 480],
  ['Sakit_okean', 455],
  ['Dağ_çiçəyi', 390],
  [NERMIN_NICKNAME, 340],
  ['Qaranquş', 325],
  ['Bal_Pətəyi', 300],
  ['Arıçı_12', 280],
  ['Səhər_Yeli', 265],
  ['Lalə_Gülü', 240],
  ['Mavi_Qanad', 220],
  ['Nektar_5', 195],
  ['Günəbaxan', 170],
  ['Çəmən_Arısı', 150],
  ['Yarpaq_3', 120],
  ['Qızıl_Damcı', 95],
  ['Şehli_Ot', 80],
  ['Arı_Leyli', 55],
  ['Kiçik_Pətək', 30],
];

export const countryLeague = (): LeagueRow[] =>
  COUNTRY_LEAGUE.map(([nickname, points], i) => ({ place: i + 1, nickname, points }));

export function studentProfile(studentId: string): StudentProfile {
  if (studentId !== NERMIN)
    return {
      personId: FRESH,
      name: null,
      grade: 7,
      nickname: 'Arıcıq_481',
      plan: 'free',
      points: { total: 0, week: 0, today: 0 },
      streak: 0,
      shields: 0,
      rank: rankFor(0),
      league: null,
      goal: { kind: 'school' },
      dailyMinutes: 20,
      classIds: [],
      subjectId: R7,
    };
  const points = { total: 2140, week: 340, today: 45 };
  return {
    personId: NERMIN,
    name: 'Nərmin',
    grade: 7,
    nickname: NERMIN_NICKNAME,
    plan: 'free',
    points,
    streak: 12,
    shields: 1,
    rank: rankFor(points.total),
    league: {
      id: 'tulip',
      place: COUNTRY_LEAGUE.findIndex(([nick]) => nick === NERMIN_NICKNAME) + 1,
    },
    goal: { kind: 'school' },
    dailyMinutes: 20,
    classIds: [CLASS_7B],
    subjectId: R7,
  };
}

export function teacherProfile(clock: Clock): TeacherProfile {
  return {
    personId: LALE,
    subject: 'Riyaziyyat',
    grade: 7,
    verification: 'pending',
    submittedAt: clock.at(-1, 10, 15),
    classIds: [CLASS_7B, CLASS_7A],
    listing: {
      pricePerHour: null,
      subjects: ['Riyaziyyat'],
      gradeFrom: 5,
      gradeTo: 9,
      exams: ['graduation_9'],
      days: [0, 2, 4],
      hours: '17:00–20:00',
      bio: 'Riyaziyyatı dərslik üzrə, addım-addım izah edirəm. Buraxılışa hazırlıq.',
      reviewCount: 0,
      monthIncome: null,
    },
  };
}

export const parentProfile = (): ParentProfile => ({
  personId: SEBINE,
  phoneMasked: maskPhone(accountOf(SEBINE).phone),
});

export function childLinks(clock: Clock): ChildLink[] {
  return [
    {
      parentId: SEBINE,
      childId: NERMIN,
      relation: 'mother',
      status: 'active',
      underThirteen: false,
      // Nərmin keeps her exam plan to herself (design: "İmtahan · Paylaşılmayıb").
      grants: ['report', 'progress', 'assignments'],
      since: clock.at(-47, 19, 0),
    },
    {
      parentId: SEBINE,
      childId: ELVIN,
      relation: 'mother',
      status: 'awaiting_consent',
      underThirteen: true,
      grants: [],
      since: clock.ago(30),
    },
    {
      parentId: ELCIN,
      childId: NERMIN,
      relation: 'father',
      status: 'requested',
      underThirteen: false,
      grants: [],
      since: clock.ago(15),
    },
  ];
}

export const PARENT_CODE = 'K7Q42M';

export function codes(clock: Clock): LinkCode[] {
  return [
    { kind: 'class', code: JOIN_CODE_7B, classId: CLASS_7B },
    { kind: 'class', code: JOIN_CODE_7A, classId: CLASS_7A },
    // Valid for ten minutes from whenever the demo is opened.
    { kind: 'parent', code: PARENT_CODE, childId: NERMIN, expiresAt: clock.later(10) },
    { kind: 'parent', code: 'M4T8QW', childId: NERMIN, expiresAt: clock.ago(24 * 60) },
  ];
}

export function badges(clock: Clock, studentId: string): Badge[] {
  const earned = studentId === NERMIN;
  const when = (days: number) => (earned ? clock.at(-days, 19, 0) : null);
  return [
    { id: 'firstHoney', earnedAt: when(40) },
    { id: 'week', earnedAt: when(5) },
    { id: 'precise', earnedAt: when(3) },
    { id: 'mock', earnedAt: when(6) },
    { id: 'sealMaster', earnedAt: null },
  ];
}
