import type {
  Announcement,
  ChildAssignment,
  ChildAssignmentList,
  ChildLink,
  ChildOverview,
  DemoWorld,
  NotificationPrefs,
  ParentCodeLookup,
  ParentHome,
  ReportPage,
  ShareCategory,
  SubjectProgress,
} from '@mytutor/types';
import { makeClock } from '../clock';
import { READY_BOOK, READY_UNITS } from '../curriculum';
import { ELVIN, NERMIN, R7 } from '../ids';
import { levelOf } from '../mastery';
import { activity } from '../world/progress';
import { isLate, personOf, reaches, submissionOf } from './common';

/**
 * GET /v1/parent and /v1/parent/*. Only what a child shares leaves the server: everything else
 * is null, exactly as the real API will send it.
 */

const GRADES: Record<string, number> = { [NERMIN]: 7, [ELVIN]: 5 };
const DAY_MS = 24 * 3_600_000;

const linkOf = (world: DemoWorld, childId: string): ChildLink | undefined =>
  world.childLinks.find(
    (l) => l.parentId === world.parent.personId && l.childId === childId && l.status === 'active',
  );

const shares = (link: ChildLink | undefined, category: ShareCategory) =>
  link?.grants.includes(category) ?? false;

const classOf = (world: DemoWorld, childId: string) => {
  const member = world.members.find((m) => m.personId === childId);
  return world.classes.find((c) => c.id === member?.classId) ?? null;
};

function overview(world: DemoWorld, link: ChildLink): ChildOverview {
  const cls = classOf(world, link.childId);
  const report = world.weekReports[link.childId]?.[0];
  const active = link.status === 'active';
  return {
    childId: link.childId,
    name: personOf(world, link.childId)?.firstName ?? link.childId,
    grade: GRADES[link.childId] ?? 7,
    classId: cls?.id ?? null,
    className: cls?.shortName ?? null,
    classLabel: cls?.name ?? null,
    teacherId: cls?.teacherId ?? null,
    teacherName: cls ? (personOf(world, cls.teacherId)?.fullName ?? null) : null,
    relation: link.relation,
    status: link.status,
    underThirteen: link.underThirteen,
    grants: link.grants,
    week:
      active && report && shares(link, 'report')
        ? {
            weekStart: report.weekStart,
            minutes: report.minutes,
            activeDays: report.activeDays.filter(Boolean).length,
            newTopics: report.newTopics.length,
            assignments: shares(link, 'assignments') ? report.assignments : null,
            lastActiveAt: activity(makeClock(new Date(world.now)), link.childId).lastActiveAt,
          }
        : null,
  };
}

export function selectParentHome(world: DemoWorld): ParentHome | null {
  const person = personOf(world, world.parent.personId);
  if (!person) return null;
  const links = world.childLinks.filter(
    (l) => l.parentId === person.id && l.status !== 'requested',
  );
  return {
    person,
    profile: world.parent,
    children: links.map((l) => overview(world, l)),
    consentRequests: links
      .filter((l) => l.status === 'awaiting_consent')
      .map((l) => ({
        childId: l.childId,
        childName: personOf(world, l.childId)?.firstName ?? l.childId,
        phoneMasked: world.parent.phoneMasked,
      })),
  };
}

export function selectChildReport(
  world: DemoWorld,
  childId: string,
  week: number,
): ReportPage | null {
  const link = linkOf(world, childId);
  if (!link) return null;
  const weeks = shares(link, 'report') ? (world.weekReports[childId] ?? []) : [];
  const found = weeks[week];
  if (!found) return { report: null, hasPrevious: false, hasNext: week > 0 };
  return {
    report: {
      ...found,
      assignments: shares(link, 'assignments') ? found.assignments : null,
      examReadiness: shares(link, 'exam') ? found.examReadiness : null,
    },
    hasPrevious: week + 1 < weeks.length,
    hasNext: week > 0,
  };
}

export function selectChildProgress(world: DemoWorld, childId: string): SubjectProgress[] | null {
  const link = linkOf(world, childId);
  if (!link) return null;
  if (!shares(link, 'progress')) return [];
  const map = world.mastery[childId] ?? {};
  return [
    {
      subjectId: R7,
      title: 'Riyaziyyat 7',
      book: READY_BOOK,
      units: READY_UNITS.map((u) => ({
        unitId: u.id,
        number: u.number,
        title: u.title,
        topics: u.topics.map((t) => ({
          topicId: t.id,
          number: t.number,
          level: levelOf(map, t.id),
        })),
      })),
      recentTests: world.testScores[childId] ?? [],
    },
  ];
}

export function selectChildAssignments(
  world: DemoWorld,
  childId: string,
): ChildAssignmentList | null {
  const link = linkOf(world, childId);
  const cls = classOf(world, childId);
  if (!link || !shares(link, 'assignments') || !cls) return null;
  const items = world.assignments
    .filter((a) => a.classId === cls.id && reaches(world, a, childId))
    .sort((a, b) => b.dueAt.localeCompare(a.dueAt))
    .map((a): ChildAssignment => {
      const s = submissionOf(world, a.id, childId);
      const late = isLate(world, a, s);
      return {
        id: a.id,
        title: a.title,
        dueAt: a.dueAt,
        state: s?.state ?? 'not_started',
        late,
        lateDays: late ? Math.ceil((Date.parse(world.now) - Date.parse(a.dueAt)) / DAY_MS) : 0,
        progress: s?.progress ?? null,
        submittedAt: s?.submittedAt ?? null,
        onTime: s?.submittedAt ? s.submittedAt <= a.dueAt : !late,
        kind: a.kind,
        grade: s?.grade ?? null,
      };
    });
  return { classLabel: cls.name, items };
}

export function selectParentCode(world: DemoWorld, code: string): ParentCodeLookup | null {
  const found = world.codes.find(
    (c) => c.kind === 'parent' && c.code === code.trim().toUpperCase(),
  );
  if (!found || found.kind !== 'parent') return null;
  return {
    code: found.code,
    childId: found.childId,
    childName: personOf(world, found.childId)?.firstName ?? found.childId,
    grade: GRADES[found.childId] ?? 7,
    expired: found.expiresAt <= world.now,
    alreadyLinked: linkOf(world, found.childId) !== undefined,
  };
}

export const selectNotificationPrefs = (world: DemoWorld): NotificationPrefs =>
  world.notificationPrefs;

/** GET /v1/parent/notes: the teachers' class notes of the classes the parent's children are in. */
export function selectParentNotes(world: DemoWorld): Announcement[] {
  const classIds = new Set(
    world.childLinks
      .filter((l) => l.parentId === world.parent.personId && l.status === 'active')
      .flatMap((l) => classOf(world, l.childId)?.id ?? []),
  );
  return world.announcements
    .filter((a) => classIds.has(a.classId))
    .sort((a, b) => b.at.localeCompare(a.at));
}
