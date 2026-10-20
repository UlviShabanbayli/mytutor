import type {
  DemoWorld,
  LeagueScope,
  LinkCode,
  LeagueTable,
  MeProgress,
  MeResponse,
  PlanFeature,
  TextbookProgress,
} from '@mytutor/types';
import { makeClock } from '../clock';
import { countLevels, filledCount } from '../mastery';
import { selectClasses } from './classes';
import { personOf, studentMap } from './common';
import { RANKS } from '../world/profiles';

/** GET /v1/me, /v1/me/parent-code and /v1/league. */

const PLAN_FEATURES: PlanFeature[] = [
  { id: 'lessons', free: 'yes', premium: 'yes' },
  { id: 'review', free: 'yes', premium: 'yes' },
  { id: 'askAi', free: 'limited', premium: 'unlimited' },
  { id: 'askPhoto', free: 'limited', premium: 'unlimited' },
  { id: 'examPlan', free: 'basic', premium: 'full' },
  { id: 'videos', free: 'some', premium: 'all' },
  { id: 'offline', free: 'no', premium: 'yes' },
];

function textbooks(world: DemoWorld): TextbookProgress[] {
  const map = studentMap(world);
  return world.curriculum.subjects
    .filter((s) => s.textbookIds.length > 0)
    .map((s) => {
      const choice = world.curriculum.choices.find((c) => c.subjectId === s.id);
      const book = world.curriculum.textbooks.find(
        (t) => t.id === (choice?.textbookId ?? s.textbookIds[0]),
      );
      const volume = book?.volumes.find((v) => v.part === (choice?.part ?? 1));
      const units = volume?.units ?? [];
      const topics = units.reduce((n, u) => n + u.topics.length, 0);
      const ready = volume?.ready ?? false;
      return {
        subjectId: s.id,
        title: `${s.name} ${s.grade}`,
        status: ready ? 'ready' : 'soon',
        topics,
        units: units.length,
        levels: ready
          ? countLevels(map)
          : {
              not_started: topics,
              lesson_completed: 0,
              mastered: 0,
              reinforced: 0,
              needs_practice: 0,
            },
      };
    });
}

export function selectMe(world: DemoWorld): MeResponse | null {
  const { student } = world;
  const person = personOf(world, student.personId);
  if (!person) return null;
  const me = student.personId;
  const classmates = world.members.filter((m) => student.classIds.includes(m.classId));
  const mine = classmates.find((m) => m.personId === me);
  const behind = classmates.filter(
    (m) => m.personId !== me && m.weekPoints < (mine?.weekPoints ?? 0),
  );
  const others = classmates.filter((m) => m.personId !== me).length;
  return {
    persona: world.persona,
    person,
    profile: student,
    nextRank: RANKS.find((r) => r.minPoints > student.points.total) ?? null,
    honeyCells: filledCount(studentMap(world)),
    badges: world.badges,
    textbooks: textbooks(world),
    unreadInClasses: selectClasses(world).reduce((n, c) => n + c.unread, 0),
    parents: world.childLinks
      .filter((l) => l.childId === me)
      .map((l) => ({
        parentId: l.parentId,
        name: personOf(world, l.parentId)?.fullName ?? l.parentId,
        relation: l.relation,
        status: l.status,
        since: l.since,
      })),
    classComparison: others > 0 ? Math.round((behind.length / others) * 100) : null,
    planFeatures: PLAN_FEATURES,
  };
}

/** The code the student gives a parent (Mən → Valideyn); null when none is valid now. */
export function selectMyParentCode(world: DemoWorld): LinkCode | null {
  return (
    world.codes.find(
      (c) => c.kind === 'parent' && c.childId === world.student.personId && c.expiresAt > world.now,
    ) ?? null
  );
}

/** Days until the league week closes on Sunday night. */
const daysLeft = (world: DemoWorld) => 6 - makeClock(new Date(world.now)).weekday;

/** GET /v1/me/progress: the student's last seven days and recent results, newest first. */
export function selectMyProgress(world: DemoWorld): MeProgress {
  const me = world.student.personId;
  return {
    week: world.weekReports[me]?.[0] ?? null,
    recentTests: [...(world.testScores[me] ?? [])].sort((a, b) =>
      b.takenAt.localeCompare(a.takenAt),
    ),
  };
}

export function selectLeague(world: DemoWorld, scope: LeagueScope): LeagueTable {
  const { student } = world;
  if (scope === 'class') {
    const rows = world.members
      .filter((m) => student.classIds[0] !== undefined && m.classId === student.classIds[0])
      .sort((a, b) => b.weekPoints - a.weekPoints)
      .map((m, i) => ({
        place: i + 1,
        nickname: m.nickname,
        points: m.weekPoints,
        ...(m.personId === student.personId ? { me: true } : {}),
      }));
    return {
      scope,
      league: student.league?.id ?? 'clover',
      place: rows.find((r) => r.me)?.place ?? null,
      daysLeft: daysLeft(world),
      promote: 0,
      demote: 0,
      rows,
    };
  }
  const rows = world.countryLeague.map((r) =>
    r.nickname === student.nickname ? { ...r, me: true } : r,
  );
  return {
    scope,
    league: student.league?.id ?? 'clover',
    place: student.league?.place ?? null,
    daysLeft: daysLeft(world),
    promote: 5,
    demote: 5,
    rows,
  };
}
